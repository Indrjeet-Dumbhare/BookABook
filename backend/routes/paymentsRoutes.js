import express from 'express';
import { createOrder, verifyPayment, getPayment } from '../controllers/paymentsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/:transaction_id', authenticate, getPayment);

export default router;