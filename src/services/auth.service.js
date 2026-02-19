import jwt from 'jsonwebtoken'

export const generateToken = (user) => {
    console.log("Passsaklsj", user.password);

    jwt.sign({
        UserId: user._id,
        email: user.email
    }, process.env.JWT_SECRET,
        { expiresIn: '3d' }
    )
}