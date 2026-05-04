import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from '../utils/db.js'

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

//  Cookie options ------------------------
const cookieOptions = {
  httpOnly: true,
  secure: false,            // keep false in development
  sameSite: 'lax',          // 🔥 CHANGE THIS
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

//  REGISTER -------------------------------
const register = async (req, res) => {
  const { first_name, last_name, email, password, phone, address } = req.body;

  // validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'first_name, last_name, email and password are required.' });
  }

  // concatenate here
  const full_name = `${first_name.trim()} ${last_name.trim()}`;

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1`, [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, password_hash, phone || null, address || null]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.cookie('token', token, cookieOptions);
    
    return res.status(201).json({ user });
  } catch (err) {
  console.error('[register FULL ERROR]', err);
  return res.status(500).json({ error: err.message }); // 🔥 CHANGE THIS
}
};

//  LOGIN ----------------------------------------
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.cookie('token', token, cookieOptions);

    const { password_hash, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, phone, address, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[getMe]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

//  LOGOUT ------------------------------------
const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  return res.json({ message: 'Logged out successfully.' });
};

export { register, login, logout ,getMe};