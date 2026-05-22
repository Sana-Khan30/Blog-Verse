import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/:blogId', getComments);
router.post('/:blogId', verifyToken, addComment);
router.delete('/:commentId', verifyToken, deleteComment);

export default router;