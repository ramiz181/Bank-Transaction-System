import express from 'express'
import { authentication, authSystemUser } from '../middlewares/auth.middlewares.js'
import { createInitialFundTransaction, createTransactionController } from '../controllers/transaction.controller.js'

const router = express.Router()

router.post('/', authentication, createTransactionController)
router.post('/inital-fund', authSystemUser, createInitialFundTransaction)

export default router