import pool from "../utils/db.js"


export const getCopies = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT bc.*, b.title, b.author, b.genre, u.full_name as owner_name,
             COALESCE(
               json_agg(ci.image_url ORDER BY ci.display_order) FILTER (WHERE ci.image_url IS NOT NULL), '[]'
             ) AS images
      FROM book_copies bc
      JOIN books b ON bc.book_id = b.id
      JOIN users u ON bc.owner_id = u.id
      LEFT JOIN copy_images ci ON ci.book_copy_id = bc.id
      GROUP BY bc.id, b.title, b.author, b.genre, u.full_name
    `)
    res.json({ copies: result.rows, total: result.rows.length })
  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
}


export const getCopiesById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT bc.*, b.title, b.author, b.genre, u.full_name as owner_name
      FROM book_copies bc
      JOIN books b ON bc.book_id = b.id
      JOIN users u ON bc.owner_id = u.id
      WHERE bc.id = $1
    `, [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Copy not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
}

export const getMyCopies = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        bc.*,
        b.title,
        b.author,
        b.genre,

        COALESCE(
          json_agg(ci.image_url)
          FILTER (WHERE ci.image_url IS NOT NULL),
          '[]'
        ) AS images

      FROM book_copies bc

      JOIN books b
      ON bc.book_id = b.id

      LEFT JOIN copy_images ci
      ON ci.book_copy_id = bc.id

      WHERE bc.owner_id = $1

      GROUP BY 
        bc.id,
        b.title,
        b.author,
        b.genre

      ORDER BY bc.listed_at DESC
      `,
      [req.user.id],
    )

    res.json({
      copies: result.rows,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: error.message,
    })
  }
}

export const createCopy = async (req, res) => {
  try {
    // ✅ owner_id comes from the authenticated cookie (set by auth middleware), not req.body
    const owner_id = req.user.id

    const { 
      // book fields
      title, author, isbn, genre, language, published_year, publisher,
      // copy fields
      condition, buy_price, rent_price_per_day, max_rent_days, location_city,
      for_rent, for_sale 
    } = req.body

    if (!for_rent && !for_sale) {
      return res.status(400).json({ message: "Copy must be listed for rent, sale, or both" })
    }
    if (!condition) {
      return res.status(400).json({ message: "condition is required" })
    }

    // ✅ No need to validate owner existence — req.user is already verified by auth middleware

    // Check if book exists by ISBN, if not create it
    let book = await pool.query(`SELECT id FROM books WHERE isbn = $1`, [isbn])

    if (book.rows.length === 0) {
      book = await pool.query(`
        INSERT INTO books(title, author, isbn, genre, language, published_year, publisher)
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [title, author, isbn, genre || null, language || 'English', published_year || null, publisher || null])
    }

    const book_id = book.rows[0].id

    const result = await pool.query(`
      INSERT INTO book_copies(book_id, owner_id, condition, for_rent, for_sale, buy_price, rent_price_per_day, max_rent_days, location_city)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [book_id, owner_id, condition, for_rent ?? false, for_sale ?? false, buy_price || null, rent_price_per_day || null, max_rent_days ?? 30, location_city || null])

    res.status(201).json({ message: "Copy listed", copy: result.rows[0] })

  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
}


export const updateCopy = async (req, res) => {
  try {
    const copyId = req.params.id
    // ✅ Authenticated user from cookie
    const requesterId = req.user.id

    const {
      condition, status,
      for_rent, for_sale,
      buy_price, rent_price_per_day,
      max_rent_days, location_city
    } = req.body

    // Fetch current copy state including owner
    const existing = await pool.query(
      `SELECT status, owner_id FROM book_copies WHERE id = $1`, [copyId]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Copy not found" })
    }

    // Ownership check — only the owner can update their copy
    if (existing.rows[0].owner_id !== requesterId) {
      return res.status(403).json({ message: "Forbidden: you do not own this copy" })
    }

    const currentStatus = existing.rows[0].status

    // Block edits if copy is actively rented or sold
    if (currentStatus === 'rented') {
      return res.status(409).json({ message: "Cannot edit a copy that is currently rented out" })
    }
    if (currentStatus === 'sold') {
      return res.status(409).json({ message: "Cannot edit a copy that has been sold" })
    }

    // Validate listing constraints
    if (for_rent === false && for_sale === false) {
      return res.status(400).json({ message: "Copy must be listed for rent, sale, or both" })
    }
    if (for_rent && !(rent_price_per_day > 0)) {
      return res.status(400).json({ message: "rent_price_per_day must be > 0 when for_rent is true" })
    }
    if (for_sale && !(buy_price > 0)) {
      return res.status(400).json({ message: "buy_price must be > 0 when for_sale is true" })
    }

    const result = await pool.query(
      `UPDATE book_copies
       SET condition           = $1,
           status              = $2,
           for_rent            = $3,
           for_sale            = $4,
           buy_price           = $5,
           rent_price_per_day  = $6,
           max_rent_days       = $7,
           location_city       = $8
       WHERE id = $9
       RETURNING *`,
      [
        condition, status ?? 'available',
        for_rent ?? false, for_sale ?? false,
        buy_price || null, rent_price_per_day || null,
        max_rent_days ?? 30, location_city || null,
        copyId
      ]
    )

    res.json({ message: "Copy updated", copy: result.rows[0] })

  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
}


export const deleteCopy = async (req, res) => {
  try {
    const copyId = req.params.id
    // ✅ Authenticated user from cookie
    const requesterId = req.user.id

    const copy = await pool.query(
      `SELECT status, owner_id FROM book_copies WHERE id = $1`, [copyId]
    )
    if (copy.rows.length === 0) {
      return res.status(404).json({ message: "Copy not found" })
    }

    // ✅ Ownership check — only the owner can delete their copy
    if (copy.rows[0].owner_id !== requesterId) {
      return res.status(403).json({ message: "Forbidden: you do not own this copy" })
    }

    const currentStatus = copy.rows[0].status

    if (currentStatus === 'rented') {
      return res.status(409).json({ message: "Cannot delete a copy that is currently rented out" })
    }
    if (currentStatus === 'sold') {
      return res.status(409).json({ message: "Cannot delete a copy that has been sold" })
    }

    // Block if any non-cancelled transaction exists
    const activeTx = await pool.query(
      `SELECT 1 FROM transactions
       WHERE book_copy_id = $1
         AND status NOT IN ('cancelled')`,
      [copyId]
    )
    if (activeTx.rows.length > 0) {
      return res.status(409).json({ message: "Cannot delete copy with existing transactions — cancel them first" })
    }

    await pool.query(`DELETE FROM book_copies WHERE id = $1`, [copyId])

    res.json({ message: "Copy deleted" })

  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
}