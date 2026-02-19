import express from 'express'
import { handleUserRegister } from '../controllers/auth.controller.js'

const router = express.Router()

/* POST /api/auth/register */
router.post('/register', handleUserRegister)




export default router