import express from 'express'
import { authentication } from '../middlewares/auth.middlewares.js'
import { createAccountController } from '../controllers/account.controller.js'

const router = express.Router()

/**
 * - POST /api/account/
 * - create new account
 * - protected route
 */
router.post('/', authentication, createAccountController)

export default router