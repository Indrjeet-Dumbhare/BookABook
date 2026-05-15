import express from "express";

import {
  getCopies,
  getCopiesById,
  createCopy,
  updateCopy,
  deleteCopy,
  getMyCopies,
} from "../controllers/copiesController.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCopies);

router.get("/user/me", authenticate, getMyCopies);

router.get("/:id", getCopiesById);

router.post("/copies", authenticate, createCopy);

router.put("/:id", authenticate, updateCopy);

router.delete("/:id", authenticate, deleteCopy);

export default router;