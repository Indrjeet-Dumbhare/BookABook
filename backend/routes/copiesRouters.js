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

router.get ('/copies', getCopies);        

router.get ('/copies/:id', getCopiesById);       

router.post('/copies',authenticate, createCopy);  

router.patch('/copies/:id',authenticate, updateCopy);

router.delete('/copies/:id',authenticate, deleteCopy);

export default router;