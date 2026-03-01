import { Account } from "../models/account.model.js"
import { Transaction } from "../models/transaction.model.js"

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
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount toAccount amount idempotencyKey are required"
        })
    }
    const fromUserAccount = await Account.findOne({ fromAccount })
    const toUserAccount = await Account.findOne({ toAccount })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or/and toAccount"
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
        // COMPLETED FAILED REVERSED
        else if (existingTransaction.status === 'COMPLETED') {
            return res.status(200).json({
                message: 'Transaction already processed',
                transation: existingTransaction
            })
        }
        else if (existingTransaction.status === 'FAILED') {
            return res.status(500).json({
                message: 'Transaction processing failed, please retry'
            })
        }
        else if (existingTransaction.status === 'REVERSED') {
            return res.status(500).json({
                message: 'Transaction has been undone, please retry'
            })
        }
    }
    /**
        * 3. check account status
    */
    if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
        return res.status(400).json({
            error: "Both fromAccount & toAccount must be 'ACTIVE' to proceed transaction"
        })
    }
}