import express from 'express'
import { getBooks , getBookById , updateBook , deleteBook , createBook} from '../controllers/booksController.js'

const router = express.Router();

router.get('/', getBooks);

router.get('/:id', getBookById);

router.post('/', createBook);

router.put('/:id', updateBook);

router.delete('/:id', deleteBook);

export default router;