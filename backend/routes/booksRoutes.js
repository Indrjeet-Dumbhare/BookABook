import express from 'express'
import { getBooks , getBookById , updateBook , deleteBook , createBook} from '../controllers/booksController.js'
import {authenticate,requireAdmin} from '../middleware/authMiddleware.js'


const router = express.Router();

router.get ('/books',getBooks);          

router.get ('/books/:id', getBookById);       

router.post('/books',authenticate, createBook);        

router.patch('/books/:id', authenticate, updateBook);

router.delete('/books/:id', authenticate, requireAdmin, deleteBook);

export default router;