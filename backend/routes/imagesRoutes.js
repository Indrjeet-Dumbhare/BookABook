import express from "express";
import upload from '../middleware/multer.js'
import {
    getImages,
    addCopyImages,
    deleteImages
} from "../controllers/imagesController.js"

const router = express.Router();

router.get('/:id/images',getImages);

router.post('/:id/images',upload.array("images",5),addCopyImages);

router.delete('/:id/images/:imageId',deleteImages);

export default router;