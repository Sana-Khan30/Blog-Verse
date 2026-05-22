import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

// ─── GET ALL BLOGS ─────────────────────────────────
// GET /api/blogs
export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const { search, category, sortBy } = req.query;

    let filter = { isPublished: true };

    // Regex-based case-insensitive search across title, category, tags
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (sortBy === 'popular') sort = { views: -1 };
    if (sortBy === 'liked') sort = { likes: -1 };

    let blogs = await Blog.find(filter)
      .populate('author', 'username avatar')
      .populate('commentsCount')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Author username post-filter (MongoDB can't join for populated fields in regex)
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      blogs = blogs.filter(b =>
        b.author?.username?.toLowerCase().includes(searchLower)
      );
    }

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message,
    });
  }
};

// ─── GET SINGLE BLOG ───────────────────────────────
// GET /api/blogs/:slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'username avatar bio')
      .populate('commentsCount');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // View count badhao
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
    });
  }
};

// ─── CREATE BLOG ───────────────────────────────────
// POST /api/blogs  (Protected)
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags, excerpt, coverImage } = req.body;

    const blog = await Blog.create({
      title,
      content,
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      excerpt,
      coverImage: coverImage || '',
      author: req.user._id,
    });

    const populatedBlog = await blog.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully!',
      blog: populatedBlog,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message,
    });
  }
};

// ─── UPDATE BLOG ─────────────────────────────────
// PUT /api/blogs/:id  (Protected)
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    const { title, content, category, tags, excerpt, coverImage } = req.body;

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (tags) blog.tags = tags.split(',').map((t) => t.trim());
    if (excerpt) blog.excerpt = excerpt;
    if (coverImage) blog.coverImage = coverImage;

    const updatedBlog = await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully!',
      blog: updatedBlog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating blog' });
  }
};

// ─── DELETE BLOG ─────────────────────────────────
// DELETE /api/blogs/:id  (Protected)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }

    await Blog.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ blog: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting blog' });
  }
};

// ─── LIKE / UNLIKE BLOG ──────────────────────────
// PUT /api/blogs/:id/like  (Protected)
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const userId = req.user._id.toString();
    const isLiked = blog.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      blog.likes.push(req.user._id);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Blog unliked' : 'Blog liked!',
      likesCount: blog.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling like' });
  }
};

// ─── GET USER BLOGS ──────────────────────────────
// GET /api/blogs/user/:userId
export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.userId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user blogs' });
  }
};