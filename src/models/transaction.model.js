import mongoose from "mongoose";
import { createRef } from "react";

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, "Transaction must be associated with a 'from' account"],
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, "Transaction must be associated with a 'to' account"],
    },
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
            message: "Status can be 'PENDING', 'COMPLETED', 'FAILED', or 'REVERSED'"
        },
        default: 'PENDING'
    },
    amount: {
        type: Number,
        min: [1, 'Transaction amount must be at least 1'],
        required: [true, 'Amount is required for creating a transaction']
    },
    idempotencyKey: {
        type: String,
        required: [true, 'Idempotency key is required for creating a transaction'],
        unique: true,
        index: true
    }
}, { timestamps: true })

// -1 means newest → oldest ---- I want latest entries first
transactionSchema.index({ fromAccount: +1, createdAt: -1 })
transactionSchema.index({ toAccount: +1, createdAt: -1 })

export const Transaction = mongoose.model('Transaction', transactionSchema)