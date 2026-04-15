import pool from "../db.js";

// GET all users
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, phone, address, created_at FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password_hash, ...user } = result.rows[0];

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// CREATE user
export const createUser = async (req, res) => {
  try {
    const { full_name, email, password, phone, address } = req.body;

    const result = await pool.query(
      `INSERT INTO users(full_name,email,password_hash,phone,address) 
       VALUES($1,$2,$3,$4,$5)
       RETURNING id, full_name, email, role, is_active, phone, address, created_at`,
      [full_name, email, password, phone || null, address || null]
    );

    res.status(201).json({
      message: "User created",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, email, password, phone, address } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET full_name = $1,
           email = $2,
           password_hash = $3,
           phone = $4,
           address = $5
       WHERE id = $6
       RETURNING id, full_name, email, role, is_active, phone, address, created_at`,
      [full_name, email, password, phone || null, address || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await pool.query(
      "SELECT is_active FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const check = await pool.query(
      `SELECT 1 FROM transactions 
       WHERE buyer_renter_id = $1 
          OR seller_owner_id = $1`,
      [userId]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        message: "User cannot be deleted, has transactions"
      });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.json({ message: "User deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};