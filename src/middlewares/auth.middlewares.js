import userModel from "../models/user.model.js"
import { verifyToken } from "../services/auth.service.js"

export const authentication = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers?.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user, token missing"
            })
        }
        const decoded = verifyToken(token)
        console.log("decoded token ", decoded);

        const user = userModel.findById(decoded)
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