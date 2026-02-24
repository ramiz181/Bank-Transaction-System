import jwt from 'jsonwebtoken'

export const generateToken = (user) => {

    return jwt.sign({
        UserId: user._id,
        name: user.name,
        email: user.email
    }, process.env.JWT_SECRET,
        { expiresIn: '3d' }
    )
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}