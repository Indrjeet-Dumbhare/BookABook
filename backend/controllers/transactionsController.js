import pool from '../utils/db.js'

// ─── Helper ───────────────────────────────────────────────────────────────────
const isOverdue = (rentEndDate) => rentEndDate && new Date(rentEndDate) < new Date();

// ─── CREATE TRANSACTION (initiate rent or buy) ────────────────────────────────
/**
 * POST /api/transactions
 * Body: { book_copy_id, transaction_type, rent_start_date?, rent_end_date? }
 */
const createTransaction = async (req, res) => {
  const buyer_renter_id = req.user.id; // from auth middleware
  const { book_copy_id, transaction_type, rent_start_date, rent_end_date } = req.body;

  if (!book_copy_id || !transaction_type) {
    return res.status(400).json({ error: 'book_copy_id and transaction_type are required.' });
  }
  if (!['buy', 'rent'].includes(transaction_type)) {
    return res.status(400).json({ error: 'transaction_type must be "buy" or "rent".' });
  }
  if (transaction_type === 'rent' && (!rent_start_date || !rent_end_date)) {
    return res.status(400).json({ error: 'rent_start_date and rent_end_date are required for rentals.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lock and fetch the copy
    const copyResult = await client.query(
      `SELECT bc.*, b.title
       FROM book_copies bc
       JOIN books b ON b.id = bc.book_id
       WHERE bc.id = $1
       FOR UPDATE`,
      [book_copy_id]
    );
    if (copyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Book copy not found.' });
    }

    const copy = copyResult.rows[0];

    // 2. Ownership check
    if (copy.owner_id === buyer_renter_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You cannot transact with your own listing.' });
    }

    // 3. Availability check
    if (copy.status !== 'available') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `Book copy is currently "${copy.status}" and not available.` });
    }

    // 4. Listing-type check
    if (transaction_type === 'rent' && !copy.for_rent) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This copy is not listed for rent.' });
    }
    if (transaction_type === 'buy' && !copy.for_sale) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This copy is not listed for sale.' });
    }

    // 5. Calculate amount
    let amount;
    if (transaction_type === 'buy') {
      amount = copy.buy_price;
    } else {
      const start = new Date(rent_start_date);
      const end = new Date(rent_end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'rent_end_date must be after rent_start_date.' });
      }
      if (copy.max_rent_days && days > copy.max_rent_days) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Rental cannot exceed ${copy.max_rent_days} days.` });
      }
      amount = copy.rent_price_per_day * days;
    }

    // 6. Create transaction (status = 'pending' until payment)
    const txResult = await client.query(
      `INSERT INTO transactions
         (book_copy_id, buyer_renter_id, seller_owner_id, transaction_type,
          amount, rent_start_date, rent_end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [
        book_copy_id,
        buyer_renter_id,
        copy.owner_id,
        transaction_type,
        amount,
        rent_start_date || null,
        rent_end_date || null,
      ]
    );

    // 7. Mark copy as rented/sold optimistically
    const newCopyStatus = transaction_type === 'buy' ? 'sold' : 'rented';
    await client.query(
      `UPDATE book_copies SET status = $1 WHERE id = $2`,
      [newCopyStatus, book_copy_id]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Transaction created. Proceed to payment.',
      transaction: txResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[createTransaction]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// ─── GET ALL TRANSACTIONS (admin or own) ─────────────────────────────────────
/**
 * GET /api/transactions
 * Query: ?status=active&type=rent
 */
const getTransactions = async (req, res) => {
  const { id: userId, role } = req.user;
  const { status, type } = req.query;

  const conditions = [];
  const params = [];

  // If not admin → only show user's transactions
  if (role !== 'admin') {
    params.push(userId);
    conditions.push(
      `(t.buyer_renter_id = $${params.length} OR t.seller_owner_id = $${params.length})`
    );
  }

  // Filter by status
  if (status) {
    params.push(status);
    conditions.push(`t.status = $${params.length}`);
  }

  // Filter by type
  if (type) {
    params.push(type);
    conditions.push(`t.transaction_type = $${params.length}`);
  }

  // Build WHERE clause
  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  try {
    const result = await pool.query(
      `SELECT t.*,
              b.title AS book_title,
              b.author AS book_author,
              u1.full_name AS renter_buyer_name,
              u2.full_name AS seller_owner_name,
              f.amount AS fine_amount,
              f.paid AS fine_paid
       FROM transactions t
       JOIN book_copies bc ON bc.id = t.book_copy_id
       JOIN books b ON b.id = bc.book_id
       JOIN users u1 ON u1.id = t.buyer_renter_id
       JOIN users u2 ON u2.id = t.seller_owner_id
       LEFT JOIN fines f ON f.transaction_id = t.id
       ${whereClause}
       ORDER BY t.created_at DESC`,
      params
    );

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error('[getTransactions]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET SINGLE TRANSACTION ───────────────────────────────────────────────────
/**
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const result = await pool.query(
      `SELECT t.*,
              b.title        AS book_title,
              b.author       AS book_author,
              b.isbn,
              u1.full_name   AS renter_buyer_name,
              u1.email       AS renter_buyer_email,
              u2.full_name   AS seller_owner_name,
              u2.email       AS seller_owner_email,
              f.amount       AS fine_amount,
              f.paid         AS fine_paid,
              f.days_overdue,
              p.status       AS payment_status,
              p.payment_method,
              p.paid_at
       FROM transactions t
       JOIN book_copies bc ON bc.id = t.book_copy_id
       JOIN books b        ON b.id  = bc.book_id
       JOIN users u1       ON u1.id = t.buyer_renter_id
       JOIN users u2       ON u2.id = t.seller_owner_id
       LEFT JOIN fines f   ON f.transaction_id = t.id
       LEFT JOIN payments p ON p.transaction_id = t.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const tx = result.rows[0];

    // Access control: only parties involved or admin
    if (role !== 'admin' && tx.buyer_renter_id !== userId && tx.seller_owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.json(tx);
  } catch (err) {
    console.error('[getTransactionById]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── MARK AS RETURNED ─────────────────────────────────────────────────────────
/**
 * PATCH /api/transactions/:id/return
 * Only the owner (seller_owner_id) or admin can mark a book as returned.
 */
const markAsReturned = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `SELECT * FROM transactions WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const tx = result.rows[0];

    if (role !== 'admin' && tx.seller_owner_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Only the book owner or admin can mark a book as returned.' });
    }

    if (tx.transaction_type !== 'rent') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Only rental transactions can be returned.' });
    }

    if (!['active', 'overdue'].includes(tx.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Cannot return a transaction with status "${tx.status}".` });
    }

    const actualReturn = new Date();
    const wasOverdue = isOverdue(tx.rent_end_date);

    // Update transaction
    const updated = await client.query(
      `UPDATE transactions
       SET status = 'returned', actual_return_date = $1
       WHERE id = $2
       RETURNING *`,
      [actualReturn, id]
    );

    // If overdue, create/update fine
    let fine = null;
    if (wasOverdue) {
      const endDate = new Date(tx.rent_end_date);
      const daysOverdue = Math.ceil((actualReturn - endDate) / (1000 * 60 * 60 * 24));
      const FINE_RATE_PER_DAY = 10.00; // ₹10/day — make this configurable
      const fineAmount = daysOverdue * FINE_RATE_PER_DAY;

      const existingFine = await client.query(
        `SELECT id FROM fines WHERE transaction_id = $1`, [id]
      );
      if (existingFine.rows.length === 0) {
        const fineResult = await client.query(
          `INSERT INTO fines (transaction_id, user_id, amount, rate_applied, days_overdue)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [id, tx.buyer_renter_id, fineAmount, FINE_RATE_PER_DAY, daysOverdue]
        );
        fine = fineResult.rows[0];
      }
    }

    // Free up the book copy
    await client.query(
      `UPDATE book_copies SET status = 'available' WHERE id = $1`,
      [tx.book_copy_id]
    );

    await client.query('COMMIT');

    return res.json({
      message: wasOverdue
        ? `Book returned. A fine of ₹${fine?.amount} has been raised for ${fine?.days_overdue} overdue day(s).`
        : 'Book returned successfully.',
      transaction: updated.rows[0],
      fine,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[markAsReturned]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// ─── CANCEL TRANSACTION ───────────────────────────────────────────────────────
/**
 * PATCH /api/transactions/:id/cancel
 * Body: { reason? }
 * Only allowed when status = 'pending'. Buyer/renter or admin.
 */
const cancelTransaction = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  const { reason } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `SELECT * FROM transactions WHERE id = $1 FOR UPDATE`, [id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const tx = result.rows[0];

    if (role !== 'admin' && tx.buyer_renter_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (tx.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Only pending transactions can be cancelled. Current status: "${tx.status}".` });
    }

    const updated = await client.query(
      `UPDATE transactions
       SET status = 'cancelled', cancellation_reason = $1, cancelled_at = now()
       WHERE id = $2
       RETURNING *`,
      [reason || null, id]
    );

    // Release the book copy back to available
    await client.query(
      `UPDATE book_copies SET status = 'available' WHERE id = $1`,
      [tx.book_copy_id]
    );

    await client.query('COMMIT');

    return res.json({
      message: 'Transaction cancelled.',
      transaction: updated.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[cancelTransaction]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// ─── CRON-FRIENDLY: Mark overdue rentals ─────────────────────────────────────
/**
 * POST /api/transactions/mark-overdue  (admin or cron secret)
 * Marks all active rentals past their rent_end_date as overdue.
 */
const markOverdueTransactions = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE transactions
       SET status = 'overdue'
       WHERE transaction_type = 'rent'
         AND status = 'active'
         AND rent_end_date < CURRENT_DATE
       RETURNING id`
    );
    return res.json({
      message: `${result.rowCount} transaction(s) marked as overdue.`,
      ids: result.rows.map((r) => r.id),
    });
  } catch (err) {
    console.error('[markOverdueTransactions]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export {
  createTransaction,
  getTransactions,
  getTransactionById,
  markAsReturned,
  cancelTransaction,
  markOverdueTransactions,
};