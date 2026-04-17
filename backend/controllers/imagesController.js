import pool from "../utils/db.js"
import cloudinary from "../config/cloudinary.js";
import {uploadToCloudinary} from '../utils/uploadCloudinary.js'


export const getImages = async (req, res) => {
  try {
    const copyId = req.params.id;
    const result = await pool.query(
      `SELECT * FROM copy_images 
      WHERE book_copy_id = $1 
      ORDER BY display_order`,[copyId]
    );
    res.json({copy_images : result.rows});
  } catch (error) {
    res.status(500).send("Server error");
  }
}

export const addCopyImages = async (req, res) => {
  const client = await pool.connect();
  let images = [];

  try {
    const copyId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const check = await client.query(
      "SELECT id FROM book_copies WHERE id = $1",
      [copyId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Book copy not found" });
    }

    // Get current image count to offset display_order
    const orderResult = await client.query(
      `SELECT COUNT(*) AS count FROM copy_images WHERE book_copy_id = $1`,
      [copyId]
    );
    const startOrder = parseInt(orderResult.rows[0].count);

    images = await Promise.all(files.map((file) => uploadToCloudinary(file)));

    await client.query("BEGIN");

    const insertedImages = [];
    for (let i = 0; i < images.length; i++) {
      const result = await client.query(
        `INSERT INTO copy_images 
         (book_copy_id, image_url, cloudinary_public_id, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [copyId, images[i].url, images[i].public_id, startOrder + i]
      );
      insertedImages.push(result.rows[0]);
    }

    await client.query("COMMIT");
    res.json({ images: insertedImages });

  } catch (error) {
    await client.query("ROLLBACK");
    if (images.length > 0) {
      await Promise.all(images.map((img) => cloudinary.uploader.destroy(img.public_id)));
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const deleteImages = async (req, res) => {
  try {
    const { id: copyId, imageId } = req.params;

    // 1. Get image from DB
    const result = await pool.query(
      `SELECT * FROM copy_images 
       WHERE id = $1 AND book_copy_id = $2`,
      [imageId, copyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = result.rows[0];

    if (image.cloudinary_public_id) {
      await cloudinary.uploader.destroy(image.cloudinary_public_id);
    }

    // 3. Delete from DB
    await pool.query(
      `DELETE FROM copy_images WHERE id = $1`,
      [imageId]
    );

    res.json({ message: "Image deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


