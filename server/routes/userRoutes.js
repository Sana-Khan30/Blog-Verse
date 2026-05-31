import express from 'express';
import {
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  getBookmarks,
  toggleBookmark,
} from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

// ── SPECIFIC ROUTES PEHLE ────────────────────────
router.put('/profile',          verifyToken, updateProfile);
router.get('/bookmarks',        verifyToken, getBookmarks);
router.put('/bookmark/:blogId', verifyToken, toggleBookmark);

// ── ADMIN ────────────────────────────────────────
router.get('/',       verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

// ── GENERIC :username — LAST MEIN ────────────────
router.get('/:username', getUserProfile);

export default router;
