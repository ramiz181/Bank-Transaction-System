import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (user) => {

    return jwt.sign({
        UserId: user._id,
    }, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

/**
 * Generate Refresh Token (short-lived)
 */
export const generateRefreshToken = () => {
    const jti = uuidv4()
    return {
        token: jwt.sign(
            { jti },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        ),
        jti
    }
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
}