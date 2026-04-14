import express from 'express'
import pool from "../db.js"

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// ── root 
router.get('/', (req, res) => {

  res.json({ message: 'Welcome to Book Rent API' })
})

// ── users 
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, full_name, email, phone, address, created_at FROM users")
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get('/users/:id', async (req, res) => {

  try {

    const userId = req.params.id; 
    const result = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [userId]
    )

    if (result.rows.length === 0 ) {
      return res.status(404).json({ message: "User not found" });
    }

    const {password , ...user} = result.rows[0] ;

    res.json(user);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }

});

router.post('/users', async (req, res) => {

  try {
    const { name , email , password , phone , address } = req.body;

    const result = await pool.query(
      `INSERT INTO users(full_name,email,password_hash,phone,address) 
        VALUES($1,$2,$3,$4,$5)
        RETURNING
        id, full_name, email, role, is_active, phone, address, created_at`,
        [name , email , password , phone || null , address || null]
    )
    const newUser = result.rows[0];
    res.status(201).json({message:"new user created",newUser});
  
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
})

router.put('/users/:id', async (req, res) => {
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

    res.status(200).json({
      message: "user updated",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // check if user exists
    const user = await pool.query(
      'SELECT is_active FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // check transactions
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

    await pool.query(
      "DELETE FROM users WHERE id = $1",
      [userId]
    );

    res.json({ message: "User deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// ── books 

router.get('/books', async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM books");
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
})

router.get('/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const result = await pool.query(`SELECT * FROM books WHERE id = $1`, [bookId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send("Server error");
  }
})

router.post('/books', async (req, res) => {
  try {
    const {title ,author ,isbn ,genre ,language ,published_year ,publisher} = req.body;
    const result = await pool.query(
      `INSERT INTO books(title ,author ,isbn ,genre ,language ,published_year ,publisher) 
          VALUES($1,$2,$3,$4,$5,$6,$7)
          RETURNING
          id ,title ,author ,isbn ,genre ,language ,published_year ,publisher`,
          [title ,author ,isbn || null ,genre||null ,language ,published_year || null ,publisher || null]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).send("Server error");
  }
})

router.put('/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id
    const { title, author, isbn, genre, language, published_year, publisher } = req.body

    const result = await pool.query(
      `UPDATE books
       SET title = $1,
          author = $2,
          isbn = $3,
          genre = $4,
          language = $5,
          published_year = $6,
          publisher = $7
       WHERE id = $8
       RETURNING id, title, author, isbn, genre, language, published_year, publisher`,
      [title, author, isbn || null, genre || null, language, published_year || null, publisher || null, bookId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }

    res.json({ message: "Book updated", book: result.rows[0] })

  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
})

router.delete('/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id

    const book = await pool.query(
      `SELECT id FROM books WHERE id = $1`,
      [bookId]
    )

    if (book.rows.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }

    const copies = await pool.query(
      `SELECT 1 FROM book_copies WHERE book_id = $1`,
      [bookId]
    )

    if (copies.rows.length > 0) {
      return res.status(400).json({ message: "Book cannot be deleted, it has copies listed" })
    }

    await pool.query(`DELETE FROM books WHERE id = $1`, [bookId])

    res.json({ message: "Book deleted" })

  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
})

// ── book copies ────────────────────────────────────────────────────────────────

router.get('/copies', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT bc.*, b.title, b.author, b.genre, u.full_name as owner_name
      FROM book_copies bc
      JOIN books b ON bc.book_id = b.id
      JOIN users u ON bc.owner_id = u.id
    `)
    res.json({ copies: result.rows, total: result.rows.length })
  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
})

router.get('/copies/:id', async (req, res) => {
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
})  

router.post('/copies', async (req, res) => {
  try {
    const { 
      // book fields
      title, author, isbn, genre, language, published_year, publisher,
      // copy fields
      owner_id, condition, buy_price, rent_price_per_day, max_rent_days, location_city 
    } = req.body

    if (!owner_id || !condition) {
      return res.status(400).json({ message: "owner_id and condition are required" })
    }

    const owner = await pool.query(`SELECT id FROM users WHERE id = $1`, [owner_id])
    if (owner.rows.length === 0) {
      return res.status(404).json({ message: "Owner not found" })
    }

    // check if book exists, if not create it
    let book = await pool.query(`SELECT id FROM books WHERE isbn = $1`, [isbn])

    if (book.rows.length === 0) {
      // book doesnt exist, create it first
      book = await pool.query(`
        INSERT INTO books(title, author, isbn, genre, language, published_year, publisher)
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [title, author, isbn, genre || null, language || 'English', published_year || null, publisher || null])
    }

    const book_id = book.rows[0].id

    // now create the copy
    const result = await pool.query(`
      INSERT INTO book_copies(book_id, owner_id, condition, buy_price, rent_price_per_day, max_rent_days, location_city)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [book_id, owner_id, condition, buy_price || null, rent_price_per_day || null, max_rent_days || 30, location_city || null])

    res.status(201).json({ message: "Copy listed", copy: result.rows[0] })

  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
})

router.put('/copies/:id', async (req, res) => {
  try {
    const copyId = req.params.id
    const {
      condition, status,
      for_rent, for_sale,
      buy_price, rent_price_per_day,
      max_rent_days, location_city
    } = req.body

    // Fetch current copy state
    const existing = await pool.query(
      `SELECT status FROM book_copies WHERE id = $1`, [copyId]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Copy not found" })
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
})

router.delete('/copies/:id', async (req, res) => {
  try {
    const copyId = req.params.id

    const copy = await pool.query(
      `SELECT status FROM book_copies WHERE id = $1`, [copyId]
    )
    if (copy.rows.length === 0) {
      return res.status(404).json({ message: "Copy not found" })
    }

    const currentStatus = copy.rows[0].status

    if (currentStatus === 'rented') {
      return res.status(409).json({ message: "Cannot delete a copy that is currently rented out" })
    }
    if (currentStatus === 'sold') {
      return res.status(409).json({ message: "Cannot delete a copy that has been sold" })
    }

    // Also block if any non-cancelled transaction exists (pending, active, overdue, returned)
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
})

// ── book_copy_images ────────────────────────────────────────────────────────────────

router.get('/copies/:id/images', async (req, res) => {
  
})

router.post('/copies/:id/images', async (req, res) => {
  
})

router.delete('/copies/:id/images/:imageId', async (req, res) => {

})
  

// ── transactions ───────────────────────────────────────────────────────────────

router.get('/transactions', async (req, res) => {
  
})

router.get('/transactions/:id', async (req, res) => {
  
})

router.post('/transactions/buy', async (req, res) => {

})

router.post('/transactions/rent', async (req, res) => {
  
})

router.patch('/transactions/:id/return', async (req, res) => {
  
})

router.patch('/transactions/:id/cancel', async (req, res) => {
  
})

// ── reviews ────────────────────────────────────────────────────────────────────

router.get('/books/:id/reviews', async (req, res) => {
  
})

router.post('/books/:id/reviews', async (req, res) => {
  
})

router.delete('/reviews/:id', async (req, res) => {
  
})

// ── start ──────────────────────────────────────────────────────────────────────
export default router;