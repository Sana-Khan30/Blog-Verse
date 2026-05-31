import express from 'express';
import {
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  getBookmarks,    // ← add karo
  toggleBookmark,  // ← add karo
} from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin     from '../middleware/isAdmin.js';

const router = express.Router();

// ── Protected ────────────────────────────────────
router.put('/profile', verifyToken, updateProfile);

// ── Bookmarks ────────────────────────────────────
router.get('/bookmarks',       verifyToken, getBookmarks);
router.put('/bookmarks/:blogId', verifyToken, toggleBookmark);

// ── Admin ────────────────────────────────────────
router.get('/',    verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

// ── Public ── (last mein — generic route)
router.get('/:username', getUserProfile);

export default router;
