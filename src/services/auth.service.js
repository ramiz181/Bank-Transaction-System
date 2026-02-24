import jwt from 'jsonwebtoken'

export const generateToken = (user) => {

    jwt.sign({
        UserId: user._id,
        email: user.email
    }, process.env.JWT_SECRET,
        { expiresIn: '3d' }
    )
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        console.error('JWT verification error')
    }
}