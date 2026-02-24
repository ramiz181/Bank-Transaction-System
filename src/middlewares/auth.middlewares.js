export const authentication = (req, res, next) => {
    try {
        const token = req.cookies?.token

        if (!token) return res.status(401).json({ message: 'Unauthorized user, token missing' })

        const decoded = verifyToken(token)
        req.user = decoded
        next()

    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized user, token invalid or expired' })
    }
}