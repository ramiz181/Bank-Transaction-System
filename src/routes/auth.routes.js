import express from 'express'
import { handleUserLogin, handleUserRegister } from '../controllers/auth.controller.js'

const router = express.Router()

/* POST /api/auth/register */
router.post('/register', handleUserRegister)

/* POST /api/auth/login */
router.post('/login', handleUserLogin)


export default router