import express from 'express';
import {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  getUserBlogs,
} from '../controllers/blogController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/user/:userId', getUserBlogs);
router.get('/:slug', getBlogBySlug);

// Protected routes — verifyToken middleware pehle chalta hai
router.post('/', verifyToken, createBlog);
router.put('/:id', verifyToken, updateBlog);
router.delete('/:id', verifyToken, deleteBlog);
router.put('/:id/like', verifyToken, toggleLike);

export default router;