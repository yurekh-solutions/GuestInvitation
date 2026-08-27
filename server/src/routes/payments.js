import express from 'express';
import { createPaymentOrder, verifyPayment, getUserOrders, paymentWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/orders', protect, getUserOrders);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentWebhook);

export default router;
