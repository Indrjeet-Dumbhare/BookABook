import express from 'express'
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  markAsReturned,
  cancelTransaction,
  markOverdueTransactions,
} from '../controllers/transactionsController.js';

import {authenticate,requireAdmin} from '../middleware/authMiddleware.js'

const router = express.Router();

router.get('/', authenticate, getTransactions);

router.get('/:id', authenticate, getTransactionById);

router.post('/', authenticate, createTransaction);

router.patch('/:id/return', authenticate, markAsReturned);

router.patch('/:id/cancel', authenticate, cancelTransaction);

export default router;