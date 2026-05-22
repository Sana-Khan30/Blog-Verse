import express from 'express';
import {
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  toggleBookmark,
  getBookmarks,
} from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

// Protected
router.put('/profile', verifyToken, updateProfile);
router.get('/bookmarks', verifyToken, getBookmarks);
router.put('/bookmark/:blogId', verifyToken, toggleBookmark);

// Admin only
router.get('/', verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

// Public
router.get('/:username', getUserProfile);

export default router;