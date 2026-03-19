import { TokenBlacklist } from "../models/blacklist.model.js"
import { User } from "../models/user.model.js"
import { verifyToken } from "../services/auth.service.js"

export const authentication = async (req, res, next) => {
    try {
        const token = req.cookies?.access_token

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user, token missing"
            })
        }
        const blacklisted = await TokenBlacklist.findOne({ token })
        if (blacklisted) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user, token expired"
            })
        }
        const decoded = verifyToken(token)
        const user = await User.findById(decoded.UserId)
        req.user = user
        next()
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized user, token invalid or expired",
            errorCode: "TOKEN_INVALID"
        })
    }
}

export const authSystemUser = async (req, res, next) => {
    try {
        const token = req.cookies?.access_token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user, token missing"
            })
        }
        const blacklisted = await TokenBlacklist.findOne({ token })
        if (blacklisted) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user, token expired"
            })
        }
        const decoded = verifyToken(token)
        const user = await User.findById(decoded.UserId).select('+systemUser')
        if (!user.systemUser) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden access, not a system user'
            })
        }
        req.user = user
        return next()

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized system user, token invalid or expired",
            errorCode: "TOKEN_INVALID"
        })
    }
}