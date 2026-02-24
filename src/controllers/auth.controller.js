import User from "../models/user.model.js"
import { generateToken } from "../services/auth.service.js"
import { sendRegistrationEmail } from "../services/email.service.js"

/**
 * - POST /api/auth/register
 * - user register controller
 */
export async function handleUserRegister(req, res) {
    const { name, email, password } = req.body
    try {
        const isExists = await User.findOne({ email })
        if (isExists) {
            res.status(409).json({
                success: false,
                message: "User already exist"
            })
        }
        const user = await User.create({ name, email, password })
        user.password = undefined
        const token = generateToken(user)

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            samesite: 'none'
        }).status(201).json({
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

        const token = generateToken(user)
        res.cookie('token', token)

        res.status(200).json({
            success: true,
            message: "User successfully login"
        })
    } catch (error) {
        console.log(error);
    }
}