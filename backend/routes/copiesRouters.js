import express from 'express'
import {
    getCopies,
    getCopiesById,
    createCopy,
    updateCopy,
    deleteCopy
} from '../controllers/copiesController.js'
import {authenticate,requireAdmin} from '../middleware/authMiddleware.js'


const router = express.Router();

router.get ('/', getCopies);        

router.get ('/:id', getCopiesById);       

router.post('/',authenticate, createCopy);  

router.patch('/:id',authenticate, updateCopy);

router.delete('/:id',authenticate, deleteCopy);

export default router;