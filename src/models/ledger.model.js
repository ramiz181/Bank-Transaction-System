import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({

    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Ledger must be associated with an account'],
        immutable: true
    },
    transactionType: {
        type: String,
        enum: {
            values: ['DEBIT', 'CREDIT'],
            message: "Type can be 'DEBIT' or 'CREDIT'"
        },
        required: [true, 'Ledger type is required'],
        immutable: true
    },
    transactionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'Transaction ID is required for creating a ledger entry'],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required for creating a ledger entry'],
        min: [1, 'Amount must be at least 1'],
        immutable: true
    }

}, { timestamps: true })


// -1 means newest → oldest ---- I want latest entries first
ledgerSchema.index({ account: 1, createdAt: -1 })

function preventLedgerModification() {
    throw new Error('Ledger entries are immutable and cannot be modified')
}
// Query middleware
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification)
ledgerSchema.pre('findOneAndDelete', preventLedgerModification)
ledgerSchema.pre('updateMany', preventLedgerModification)
ledgerSchema.pre('updateOne', preventLedgerModification)
ledgerSchema.pre('deleteMany', preventLedgerModification)
ledgerSchema.pre('deleteOne', preventLedgerModification)
ledgerSchema.pre('findByIdAndUpdate', preventLedgerModification)
ledgerSchema.pre('findByIdAndDelete', preventLedgerModification)
ledgerSchema.pre('findOneAndReplace', preventLedgerModification)
ledgerSchema.pre('remove', preventLedgerModification);

// explicitly doing this cuz
// in controller:
// const entry = await Ledger.findById(accountID)
// entry.amount = 200
// entry.save()  ==> this will still work

ledgerSchema.pre('save', function (next) {

    console.log("isNew ====>>> ", !this.isNew);
    if (!this.isNew) {
        return next(new Error('Ledger entries are immutable and cannot be modified'));
    }
    next();
});



export const Ledger = mongoose.model('Ledger', ledgerSchema)