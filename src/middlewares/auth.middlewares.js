import { verifyToken } from "../services/auth.service.js"

const authentication = (req, res, next) => {
    const token = req.cookies?.token

    if (!token) res.redirect('/api/auth/login?error=please login')
    const user = verifyToken(token)
    if (!user) res.status(401).redirect('/api/auth/login?error=unauthorize user')
    req.user = user
    next()
}