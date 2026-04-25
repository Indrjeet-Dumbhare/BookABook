import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/usersController.js";
import { authenticate , requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router();

router.get('/users',authenticate, requireAdmin, getUsers);

router.get('/users/:id', authenticate, getUserById );

router.patch('/users/:id', authenticate, updateUser);

router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

export default router;