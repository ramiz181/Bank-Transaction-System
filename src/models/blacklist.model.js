import mongoose from "mongoose"

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        unique: [true, "Token is already blacklisted"],
        require: [true, "Token is require to blacklist"]
    }
}, { timestamps: true })

tokenBlacklistSchema.index({ createdAt: 1 }, {
    // timeToLive(TTL)
    expireAfterSeconds: 60 * 60 * 24 * 2
})

export const TokenBlacklist = mongoose.model('tokenBlacklist', tokenBlacklistSchema)