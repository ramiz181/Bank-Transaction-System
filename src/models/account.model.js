import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Account must be associated with a user'],
        index: true
    },
    status: {
        enum: {
            values: ['Active', 'Frozen', 'Closed'],
            message: 'Status canbe either Active, Frozen, Closed'
        },

        currency: {
            type: String,
            default: 'PKR',
            required: [true, 'Currenct is required for creating an account']
        }
    }
}, { timestamps: true })

// compound index
accountSchema.index({ user: 1, status: 1 })

export default Account = mongoose.model('Account', accountSchema)