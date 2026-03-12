import mongoose from "mongoose"
import { Account } from "../models/account.model.js"
import { Transaction } from "../models/transaction.model.js"
import { User } from "../models/user.model.js"
import { Ledger } from "../models/ledger.model.js"
import { sendTransactionEmail } from "../services/email.service.js"

/**
 * - create a new transaction 
 * - The 10 step transfer flow:
 *      1. validate request
 *      2. validate idempotency key
 *      3. check account status
 *      4. derive sender balance form ledger
 *      5. create transaction (PENDING)
 *      6. create DEBIT ledger entry
 *      7. create CREDIT ledger entry
 *      8. mark transaction COMPLETED
 *      9. commit mongoDB session
 *      10. send email notification
 */

export async function createTransactionController(req, res) {
    try {
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body
        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "fromAccount toAccount amount idempotencyKey are required"
            })
        }
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero"
            })
        }
        if (fromAccount === toAccount) {
            return res.status(400).json({
                success: false,
                message: "Cannot transfer to the same account"
            })
        }

        /**
            2. validate idempotency key
        */
        const existingTransaction = await Transaction.findOne({ idempotencyKey })

        if (existingTransaction) {
            if (existingTransaction.status === 'PENDING') {
                return res.status(202).json({
                    error: 'Request is already being processed'
                })
            }
            else if (existingTransaction.status === 'COMPLETED') {
                return res.status(200).json({
                    message: 'Transaction already processed',
                    transation: existingTransaction
                })
            }
            else if (existingTransaction.status === 'FAILED') {
                return res.status(500).json({
                    error: 'Transaction processing failed, please retry'
                })
            }
            else if (existingTransaction.status === 'REVERSED') {
                return res.status(500).json({
                    error: 'Transaction has been undone, please retry'
                })
            }
        }

        /**
            1. validate request
        */
        const [from, to] = await Promise.all([
            User.findOne({ email: fromAccount }),
            User.findOne({ email: toAccount })
        ])
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        // both queries are placed inside Promise.all([])
        // both queries run parallel,not one after another....reducing total wait time...fast DB calls
        const [fromUserAccount, toUserAccount] = await Promise.all([
            Account.findOne({ user: from._id }),
            Account.findOne({ user: to._id })
        ])
        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                success: false,
                message: "Invalid fromAccount or/and toAccount"
            })
        }

        /**
            * 3. check account status
        */
        if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
            return res.status(400).json({
                error: "Both fromAccount & toAccount must be 'ACTIVE' to proceed transaction"
            })
        }

        /**
         * 4. derive sender balance form ledger
        */
        const balance = await fromUserAccount.getBalance()
        if (balance < amount) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance, Current balance is ${balance}. Requested amount is ${amount}`
            })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        /**
         *  5. create transaction (PENDING)
        */
        const transaction = await Transaction.create([{
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            status: 'PENDING',
            amount,
            idempotencyKey,
        }], { session })

        /**
         *  6. create DEBIT ledger entry
        *   7. create CREDIT ledger entry
        *   8. mark transaction COMPLETED
        */
        const debitLedgerEntry = await Ledger.create([{
            account: fromUserAccount._id,
            transactionType: 'DEBIT',
            transactionID: transaction[0]._id,
            amount,
        }], { session })

        const creditLedgerEntry = await Ledger.create([{
            account: toUserAccount._id,
            transactionType: 'CREDIT',
            transactionID: transaction[0]._id,
            amount,
        }], { session })

        transaction[0].status = 'COMPLETED'
        await transaction[0].save({ session })

        /**
         * 9. commit mongoDB session
        */
        await session.commitTransaction()
        session.endSession()

        /**
         * 10. send email notification
        */
        sendTransactionEmail(req.user.email, req.user.name, amount, toAccount, transaction._id)

        res.status(201).json({
            success: true,
            message: "Transaction completed successfully"
        })
    } catch (error) {
        console.error("Transaction Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export async function createInitialFundTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body
    try {
        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "fromAccount toAccount amount idempotencyKey are required"
            })
        }

        const to = await User.findOne({ email: toAccount })
        const toUserAccount = await Account.findOne({ user: to._id })

        if (!toUserAccount) {
            return res.status(400).json({
                success: false,
                error: "Invalid toAccount"
            })
        }
        const systemUserAccount = await Account.findOne({ user: req.user._id })
        // possibly a dead code, but incase...
        if (!systemUserAccount) {
            return res.status(400).json({
                success: false,
                error: "System User account not found"
            })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = await Transaction.create([{
            fromAccount: systemUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
        }], { session })

        const debitLedgerEntry = await Ledger.create([{
            account: systemUserAccount._id,
            transactionType: 'DEBIT',
            transactionID: transaction[0]._id,
            amount,
        }], { session })

        const creditLedgerEntry = await Ledger.create([{
            account: toUserAccount._id,
            transactionType: 'CREDIT',
            transactionID: transaction[0]._id,
            amount,
        }], { session })

        transaction[0].status = 'COMPLETED'
        await transaction[0].save({ session })

        await session.commitTransaction()
        session.endSession()

        res.status(201).json({
            success: true,
            message: "Initial funds transaction completed successfully",
            transaction: transaction[0]
        })
    } catch (error) {
        console.error("Transaction Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}