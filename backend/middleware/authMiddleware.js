import jwt from "jsonwebtoken";
import pool from '../utils/db.js'


//  authenticate 
const authenticate = async (req, res, next) => {
  try {
    // Read token from cookie instead of Authorization header
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Confirm user still exists and is active in DB
    const result = await pool.query(
      `SELECT id, email, role, is_active FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated.' });
    }

    // Attach to request
    req.user = user; // { id, email, role, is_active }

    next();
  } catch (err) {
    console.error('[authenticate]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

//  requireAdmin 
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

export { authenticate, requireAdmin };