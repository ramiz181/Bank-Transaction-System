import express from 'express'
import { handleUserLogin, handleUserRegister, handleUserLogout } from '../controllers/auth.controller.js'

const router = express.Router()

/* POST /api/auth/register */
router.post('/register', handleUserRegister)

/* POST /api/auth/login */
router.post('/login', handleUserLogin)

/* POST /api/auth/login */
router.post('/logout', handleUserLogout)

export default router