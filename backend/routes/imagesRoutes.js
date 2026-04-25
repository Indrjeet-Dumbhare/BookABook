import express from "express";
import upload from '../middleware/multer.js'
import {
    getImages,
    addCopyImages,
    deleteImages
} from "../controllers/imagesController.js"
import {authenticate,requireAdmin} from '../middleware/authMiddleware.js'

const router = express.Router();

router.get('/:id/images',getImages);

router.post('/:id/images',authenticate,upload.array("images",5),addCopyImages);

router.delete('/:id/images/:imageId',authenticate,deleteImages);

export default router;