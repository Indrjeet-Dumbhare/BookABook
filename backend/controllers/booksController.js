import express from 'express'
import pool from "../db.js"

const router = express.Router();


export const getBooks = async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM books");
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
}



export const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const result = await pool.query(`SELECT * FROM books WHERE id = $1`, [bookId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send("Server error");
  }
}


export const createBook = async (req, res) => {
  try {
    const {title ,author ,isbn ,genre ,language ,published_year ,publisher} = req.body;

    if (!title || !author || !language) {
      return res.status(400).json({
        message: "title, author and language are required"
      });
    }
    
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
}



export const updateBook = async (req, res) => {
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
}


export const deleteBook = async (req, res) => {
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
}