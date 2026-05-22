import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';

// ─── GET COMMENTS ──────────────────────────────────
// GET /api/comments/:blogId
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching comments' });
  }
};

// ─── ADD COMMENT ───────────────────────────────────
// POST /api/comments/:blogId  (Protected)
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    // Blog exist karta hai?
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      blog: req.params.blogId,
    });

    const populatedComment = await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added!',
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

// ─── DELETE COMMENT ────────────────────────────────
// DELETE /api/comments/:commentId  (Protected)
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Sirf comment owner ya admin delete kar sakta hai
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.status(200).json({ success: true, message: 'Comment deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting comment' });
  }
};