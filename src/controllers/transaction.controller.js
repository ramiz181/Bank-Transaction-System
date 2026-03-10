import { Account } from "../models/account.model.js"
import { Transaction } from "../models/transaction.model.js"
import { User } from "../models/user.model.js"

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

        res.send('transaction done...')
    } catch (error) {
        console.error("Transaction Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}