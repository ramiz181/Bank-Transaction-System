import { Account } from "../models/account.model.js"

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
}