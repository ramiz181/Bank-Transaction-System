import { TokenBlacklist } from "../models/blacklist.model.js"
import { User } from "../models/user.model.js"
import { generateAccessToken, generateRefreshToken } from "../services/auth.service.js"
import { sendRegistrationEmail } from "../services/email.service.js"
import { setAuthCookies } from "../utils/authCookies.utils.js"
import jwt from 'jsonwebtoken'

/**
 * - POST /api/auth/register
 * - user register controller
 */
export async function handleUserRegister(req, res) {
    const { name, email, password } = req.body
    try {
        const isExists = await User.findOne({ email })
        if (isExists) {
            return res.status(409).json({
                success: false,
                message: "User already exist"
            })
        }
        const user = await User.create({ name, email, password })
        user.password = undefined

        const accessToken = generateAccessToken(user)
        const { token: refreshToken } = generateRefreshToken()

        user.refreshTokens.push({
            token: refreshToken,
            // expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        await user.save()
        setAuthCookies(res, accessToken, refreshToken)
        res.status(201).json({
            success: true,
            message: "User created successfully"
        })

        await sendRegistrationEmail(user.email, user.name)
    } catch (error) {
        console.log(error);
    }
}
/**
 * - user login controller
 * - POST api/auth/login
 */

export async function handleUserLogin(req, res) {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' })
        }
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' })
        }

        const accessToken = generateAccessToken(user)
        // destructuring 'token' and rename it to 'refreshToken'
        const { token: refreshToken } = generateRefreshToken()

        user.refreshTokens.push({
            token: refreshToken,
            // expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        user.sessionExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
        await user.save()
        setAuthCookies(res, accessToken, refreshToken)
        res.status(200).json({
            success: true,
            message: "User successfully login"
        })
    } catch (error) {
        console.log(error);
    }
}
/**
 * - user logout controller
 * - POST api/auth/logout
 */
export async function handleUserLogout(req, res) {

    try {
        const accessToken = req.cookies?.access_token
        const refreshToken = req.cookies?.refresh_token

        if (!accessToken && !refreshToken) {
            return res.status(200).json({
                success: true,
                message: 'User already logged out'
            })
        }
        if (accessToken) {
            await TokenBlacklist.create({ token: accessToken })
        }

        await User.updateOne(
            { 'refreshTokens.token': refreshToken },
            {
                // From the refreshTokens array, remove the object where token === refreshToken”
                $pull:
                    { refreshTokens: { token: refreshToken } }
            }
        )
        res.clearCookie("access_token")
        res.clearCookie("refresh_token")

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

/**
 * refresh token controller
 * api/auth/refresh_token
 */
export async function handleRefreshToken(req, res) {
    /**
     * REFRESH FLOW (Token Rotation)
        * 1. Verify refresh token
        * 2. Check if token exists in DB
        * 3. Delete old token (rotation)
        * 4. Issue new access + refresh token
    */

    const { refresh_token } = req.cookies
    try {
        // 1. Verify refresh token
        if (!refresh_token) {
            return res.status(401).json({ success: false, message: "No refresh token" });
        }
        try {
            jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET)
        } catch (error) {
            return res.status(403).json({ success: false, message: 'Invalid refresh token' })
        }

        // 2. Check if token exists in DB
        const user = await User.findOne({
            'refreshTokens.token': refresh_token
        })
        if (!user) {
            // "Token reuse detected" ==> cuz, hum logout krty wqt refreshToken dlt kr rhy hen, if ksi k pas still token h to might be possible ==> stolen ho k resue ho rha
            return res.status(403).json({ success: false, message: "Token reuse detected" });
        }

        // const tokenDoc = user.refreshTokens.find(
        //     t => t.token === refresh_token
        // )
        // if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        //     return res.status(403).json({
        //         success: false,

        //         message: 'Refresh token expired'
        //     })
        // }

        if (user.sessionExpiresAt && user.sessionExpiresAt < new Date()) {
            user.refreshTokens = user.refreshTokens.filter(
                tokens => tokens.token !== refresh_token
            )
            await user.save()
            res.clearCookie("access_token")
            res.clearCookie("refresh_token")

            return res.status(403).json({
                success: false,
                message: "Session expired. Please login again.",
            });
        }

        // 3. Delete old token (rotation)
        user.refreshTokens = user.refreshTokens.filter(t => {
            return t.token !== refresh_token
        })

        // 4. Issue new access + refresh token
        const accessToken = generateAccessToken(user)
        const { token: newRefreshToken } = generateRefreshToken()

        user.refreshTokens.push({
            token: newRefreshToken,
            // expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        await user.save()
        setAuthCookies(res, accessToken, newRefreshToken)
        res.status(201).json({ message: "Token refreshed" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}