import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Public routes — koi bhi access kar sakta hai
router.post('/register', register);
router.post('/login', login);

// Protected route — sirf logged in users
router.get('/me', verifyToken, getMe);

export default router;