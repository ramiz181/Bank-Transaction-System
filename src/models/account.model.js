import mongoose from "mongoose";
import { Ledger } from "./ledger.model.js";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Account must be associated with a user'],
    },
    // accountNumber:{
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'FROZEN', 'CLOSED'],
            message: 'Status canbe either Active, Frozen, Closed'
        },
        default: 'ACTIVE'
    },
    currency: {
        type: String,
        default: 'PKR',
        required: [true, 'Currenct is required for creating an account']
    }
}, { timestamps: true })

// compound index
accountSchema.index({ user: 1, status: 1 })

accountSchema.methods.getBalance = async function () {
    const balanceData = await Ledger.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                // _id: "$account", // example use case: when I filter($match) data by purchased items per user
                _id: null, // put all matched documents into a single group
                totalDebit: {
                    $sum: {
                        // $cond: [ condition, valueIfTrue, valueIfFalse ]
                        $cond: [
                            // if transactionType == "DEBIT"
                            { $eq: ['$transactionType', 'DEBIT'] }, // condition
                            "$amount", // valueIfTrue
                            0 // valueIfFalse
                        ],
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ['$transactionType', 'CREDIT'] },
                            '$amount',
                            0
                        ]
                    }
                }
            }
        },
        {
            // reshape the output...upar group sy _id, totalDebit, totalCredit return hoga
            // $project k bad document reshape ho k just "balance" return hoga
            $project: {
                _id: 0,
                //behaves like ==>>> balance = totalCredit - totalDebit
                balance: { $subtract: ['$totalCredit', '$totalDebit'] }
            }
        }
    ])

    // incase, if account is new....there will be no ledger entry.... + also to avoid crashing the next line ===> return balanceData[0].balance
    if (balanceData.length == 0) {
        return 0
    }

    // {
    //     Before $project, after $group, the document might look like:
    //     [
    //         {
    //             _id: null,
    //             totalCredit: 500,
    //             totalDebit: 150
    //         }
    //     ]

    //     After $project, MongoDB reshapes it to:

    //     [
    //         {
    //             balance: 350
    //         }
    //     ]
    //     so, that's why balanceData[0].balance instead of balanceData[2].project.balance......which is obvoiusly wrong at all
    // }
    return balanceData[0].balance

    // shorthand
    // return balanceData.length ? balanceData[0].balance : 0
}

export const Account = mongoose.model('Account', accountSchema)