import express from 'express'
import { authentication } from '../middlewares/auth.middlewares.js'
import { createAccountController, accountBalanceController } from '../controllers/account.controller.js'

const router = express.Router()

/**
 * - POST /api/account/
 * - create new account
 * - protected route
 */
router.post('/create', authentication, createAccountController)
router.get('/balance/:accountId', authentication, accountBalanceController)

export default router