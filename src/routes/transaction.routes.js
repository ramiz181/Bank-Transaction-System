import express from 'express'
import { authentication } from '../middlewares/auth.middlewares.js'
import { createTransactionController } from '../controllers/transaction.controller.js'

const router = express.Router()

router.post('/', authentication, createTransactionController)

export default router