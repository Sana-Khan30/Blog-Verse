import User from '../models/User.js';
import Blog from '../models/Blog.js';

// ─── GET USER PROFILE ──────────────────────────────
// GET /api/users/:username
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // User ke blogs bhi lo
    const blogs = await Blog.find({ author: user._id, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({ success: true, user, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

// ─── UPDATE PROFILE ────────────────────────────────
// PUT /api/users/profile  (Protected)
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Username change karna chahta hai?
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated!',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// ─── GET ALL USERS (Admin) ─────────────────────────
// GET /api/users  (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// ─── DELETE USER (Admin) ───────────────────────────
// DELETE /api/users/:id  (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    await Blog.deleteMany({ author: req.params.id });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

// ─── TOGGLE BOOKMARK ───────────────────────────────
// PUT /api/users/bookmark/:blogId  (Protected)
export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const blogId = req.params.blogId;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const isBookmarked = user.bookmarks.some(id => id.toString() === blogId);
    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== blogId);
    } else {
      user.bookmarks.push(blogId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Bookmark removed' : 'Blog bookmarked',
      isBookmarked: !isBookmarked,
      bookmarkCount: user.bookmarks.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating bookmark' });
  }
};

// ─── GET USER BOOKMARKS ────────────────────────────
// GET /api/users/bookmarks  (Protected)
export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      match: { isPublished: true },
      populate: [
        { path: 'author', select: 'username avatar' },
        { path: 'commentsCount' },
      ],
      options: { sort: { createdAt: -1 } },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      blogs: user.bookmarks,
      bookmarkCount: user.bookmarks.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookmarks' });
  }
};