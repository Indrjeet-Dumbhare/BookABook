import express from 'express'
import {
    getCopies,
    getCopiesById,
    createCopy,
    updateCopy,
    deleteCopy
} from '../controllers/copiesController.js'

const router = express.Router();

router.get('/', getCopies);

router.get('/:id', getCopiesById);

router.post('/', createCopy);

router.put('/:id', updateCopy);

router.delete('/:id', deleteCopy);

export default router;