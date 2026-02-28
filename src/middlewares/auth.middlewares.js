import { User } from "../models/user.model.js"
import { verifyToken } from "../services/auth.service.js"

export const authentication = async (req, res, next) => {
    try {
        const token = req.cookies?.token

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user, token missing"
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