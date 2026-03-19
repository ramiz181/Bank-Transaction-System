import express from 'express'
import { handleUserLogin, handleUserRegister, handleUserLogout, handleRefreshToken } from '../controllers/auth.controller.js'

const router = express.Router()

/* POST /api/auth/register */
router.post('/register', handleUserRegister)

/* POST /api/auth/login */
router.post('/login', handleUserLogin)

/* POST /api/auth/login */
router.post('/logout', handleUserLogout)

/* POST api/auth/refresh_token */
router.post('/refresh_token', handleRefreshToken)
export default router