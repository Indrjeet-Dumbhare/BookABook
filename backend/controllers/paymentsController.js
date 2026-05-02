import crypto from 'crypto';
import pool from '../utils/db.js';
import razorpay from '../utils/razorpay.js';

// ─── CREATE RAZORPAY ORDER ────────────────────────────────────────────────────
/**
 * POST /api/payments/create-order
 * Body: { transaction_id }
 * Called by frontend before showing Razorpay checkout
 */
const createOrder = async (req, res) => {
  const { transaction_id } = req.body;
  const userId = req.user.id;

  if (!transaction_id) {
    return res.status(400).json({ error: 'transaction_id is required.' });
  }

  try {
    // Fetch transaction — only buyer can pay
    const result = await pool.query(
      `SELECT * FROM transactions WHERE id = $1`,
      [transaction_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const tx = result.rows[0];

    if (tx.buyer_renter_id !== userId) {
      return res.status(403).json({ error: 'Only the buyer/renter can initiate payment.' });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({
        error: `Payment can only be initiated for pending transactions. Current status: "${tx.status}".`,
      });
    }

    // Check if a payment record already exists
    const existingPayment = await pool.query(
      `SELECT * FROM payments WHERE transaction_id = $1`, [transaction_id]
    );
    if (existingPayment.rows.length > 0 && existingPayment.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'This transaction has already been paid.' });
    }

    // Razorpay expects amount in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(tx.amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `txn_${transaction_id}`,
      notes: {
        transaction_id,
        buyer_id: userId,
      },
    });

    // Save/update payment record with razorpay_order_id
    await pool.query(
      `INSERT INTO payments (transaction_id, amount, status, razorpay_order_id)
       VALUES ($1, $2, 'pending', $3)
       ON CONFLICT (transaction_id)
       DO UPDATE SET razorpay_order_id = $3, status = 'pending'`,
      [transaction_id, tx.amount, order.id]
    );

    return res.status(201).json({
      order_id: order.id,
      amount: order.amount,       // in paise
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,  // frontend needs this
      transaction_id,
    });
  } catch (err) {
    console.error('[createOrder]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── VERIFY PAYMENT ───────────────────────────────────────────────────────────
/**
 * POST /api/payments/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction_id }
 * Called by frontend after Razorpay checkout succeeds
 */
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    transaction_id,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !transaction_id) {
    return res.status(400).json({ error: 'All payment fields are required.' });
  }

  // 1. Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature. Payment verification failed.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 2. Update payment record
    await client.query(
      `UPDATE payments
       SET status = 'completed',
           razorpay_payment_id = $1,
           razorpay_signature  = $2,
           payment_method      = 'razorpay',
           paid_at             = now()
       WHERE transaction_id = $3`,
      [razorpay_payment_id, razorpay_signature, transaction_id]
    );

    // 3. Activate the transaction
    await client.query(
      `UPDATE transactions
       SET status = 'active'
       WHERE id = $1`,
      [transaction_id]
    );

    await client.query('COMMIT');

    return res.json({ message: 'Payment verified. Transaction is now active.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[verifyPayment]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// ─── GET PAYMENT BY TRANSACTION ───────────────────────────────────────────────
/**
 * GET /api/payments/:transaction_id
 */
const getPayment = async (req, res) => {
  const { transaction_id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const result = await pool.query(
      `SELECT p.*, t.buyer_renter_id, t.seller_owner_id
       FROM payments p
       JOIN transactions t ON t.id = p.transaction_id
       WHERE p.transaction_id = $1`,
      [transaction_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    const payment = result.rows[0];

    if (
      role !== 'admin' &&
      payment.buyer_renter_id !== userId &&
      payment.seller_owner_id !== userId
    ) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.json(payment);
  } catch (err) {
    console.error('[getPayment]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export { createOrder, verifyPayment, getPayment };