import express from 'express'
import { getBooks , getBookById , updateBook , deleteBook , createBook} from '../controllers/booksController.js'
import {authenticate,requireAdmin} from '../middleware/authMiddleware.js'


const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", authenticate, createBook);
router.patch("/:id", authenticate, updateBook);
router.delete("/:id", authenticate, requireAdmin, deleteBook);

export default router;