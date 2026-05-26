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

// ── Admin only ──────────────────────────────
router.get('/', verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

// ── Protected ───────────────────────────────
router.get('/bookmarks', verifyToken, getBookmarks);
router.put('/bookmark/:blogId', verifyToken, toggleBookmark);
router.put('/profile', verifyToken, updateProfile);

// ── Public (MUST be last) ───────────────────
router.get('/:username', getUserProfile);

export default router;