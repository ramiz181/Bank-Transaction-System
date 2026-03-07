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
    const balance = await Ledger.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: "$account",
                balance: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$transactionType", "DEBIT"],
                                "$amount",
                            }
                        ]
                    }
                }
            }
        }
    ])
}

export const Account = mongoose.model('Account', accountSchema)