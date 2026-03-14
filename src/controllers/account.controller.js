import { Account } from "../models/account.model.js";



export const createAccountController = async (req, res) => {
    try {
        const user = req.user

        const existingAccount = await Account.findOne({ user: user._id })
        console.log(existingAccount);

        if (existingAccount) {
            return res.status(409).json({
                success: false,
                message: 'User already has an account'
            })
        }

        // Generating account number
        // const accountNumber =`AC-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        const account = await Account.create({
            user: user._id,
            // accountNumber
        })
        res.status(201).json({
            success: true,
            message: 'Account created',
            account
        })
    } catch (error) {
        console.error('Error creating account');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const accountBalanceController = async (req, res) => {

    const accountID = req.params.accountId

    const account = await Account.findOne({
        _id: accountID,
        user: req.user._id  
    })
    if (!account) {
        return res.status(404).json({
            success: false,
            error: "Account not found"
        })
    }
    const balance = await account.getBalance()
    return res.status(200).json({
        success: true,
        accountID,
        balance
    })
}