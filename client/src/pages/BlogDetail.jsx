import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getBlogBySlug, toggleLike, deleteBlog } from '../api/blogApi.js';
import { getComments, addComment, deleteComment } from '../api/commentApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  FiHeart, FiMessageCircle, FiEye, FiTrash2,
  FiEdit, FiClock, FiArrowLeft, FiBookmark,
  FiShare2, FiCheck, FiUser
} from 'react-icons/fi';

const BlogDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calculate progress based on how much of the article has been scrolled past
      const scrolled = windowHeight - elementTop;
      const progress = Math.min(100, Math.max(0, (scrolled / (windowHeight + elementHeight)) * 100));
      setReadProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blog]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const { data } = await getBlogBySlug(slug);
      setBlog(data.blog);
      setLikesCount(data.blog.likes?.length || 0);
      setLiked(user ? data.blog.likes?.includes(user._id) : false);

      const commentsRes = await getComments(data.blog._id);
      setComments(commentsRes.data.comments);
    } catch {
      toast.error('Blog not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error('Login to like blogs!', { icon: '🔒' });
    try {
      const { data } = await toggleLike(blog._id);
      setLiked(data.isLiked);
      setLikesCount(data.likesCount);
      if (data.isLiked) {
        toast.success('Liked!', { icon: '❤️' });
      }
    } catch {
      toast.error('Failed to like blog');
    }
  };

  const handleBookmark = () => {
    if (!user) return toast.error('Login to bookmark!', { icon: '🔒' });
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks!', {
      icon: bookmarked ? '🔖' : '✨',
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      toast.success('Link copied to clipboard!', { icon: '🔗' });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login to comment!', { icon: '🔒' });
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const { data } = await addComment(blog._id, { content: commentText });
      setComments([data.comment, ...comments]);
      setCommentText('');
      toast.success('Comment added!', { icon: '💬' });
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await deleteBlog(blog._id);
      toast.success('Blog deleted!');
      navigate('/');
    } catch {
      toast.error('Failed to delete blog');
    }
  };

  const readingTime = Math.ceil(blog?.content?.split(' ').length / 200) || 1;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US',
    { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-24 animate-pulse space-y-6">
      <div className="h-8 bg-white/5 rounded w-1/4" />
      <div className="h-12 bg-white/5 rounded w-3/4" />
      <div className="h-64 bg-white/5 rounded-3xl" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-white/5 rounded" />
        ))}
      </div>
    </div>
  );

  if (!blog) return null;

  const isAuthor = user?._id === blog.author?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-[4px] z-[9999] bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan"
        style={{ width: `${readProgress}%` }}
      />

      {/* Article Container */}
      <article ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft /> Back
        </motion.button>

        {/* Meta Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-sm text-primary-400 font-medium mb-4">
            {blog.category}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            {blog.title}
          </h1>

          {/* Author Row */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-4">
              {blog.author?.avatar ? (
                <img src={blog.author.avatar} alt={blog.author.username}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary-500/30" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white font-bold text-lg">
                  {blog.author?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <Link to={`/user/${blog.author?._id}`} className="font-semibold text-white hover:text-primary-400 transition-colors">
                  {blog.author?.username}
                </Link>
                <p className="text-sm text-white/50">
                  {formatDate(blog.createdAt)} · {readingTime} min read
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-white/70 hover:text-white transition-all"
              >
                {copySuccess ? <FiCheck size={16} className="text-green-400" /> : <FiShare2 size={16} />}
                <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Share'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl glass transition-all ${
                  bookmarked ? 'text-primary-400 bg-primary-500/20' : 'text-white/70 hover:text-white'
                }`}
              >
                <FiBookmark size={16} className={bookmarked ? 'fill-current' : ''} />
                <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Cover Image */}
        {blog.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden mb-10"
          >
            <img src={blog.coverImage} alt={blog.title}
              className="w-full h-[400px] md:h-[500px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
          </motion.div>
        )}

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {blog.tags.map((tag) => (
              <span key={tag}
                className="px-4 py-2 rounded-xl glass text-sm text-white/60 hover:text-white transition-colors">
                #{tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-invert prose-lg max-w-none mb-12
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-white/80 prose-p:leading-relaxed
            prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-strong:font-semibold
            prose-blockquote:text-white/60 prose-blockquote:border-l-primary-500
            prose-code:text-primary-400 prose-code:bg-white/5 prose-code:px-2 prose-code:py-1 prose-code:rounded
            prose-pre:bg-dark-700 prose-pre:border prose-pre:border-white/10
            prose-img:rounded-2xl prose-img:shadow-xl"
        >
          {blog.content}
        </motion.div>

        {/* Stats + Like Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between flex-wrap gap-4 py-6 border-y border-white/10 mb-12"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
                            onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                liked
                  ? 'bg-red-500/20 text-red-400'
                  : 'glass text-white/70 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <FiHeart size={18} className={liked ? 'fill-red-500' : ''} />
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </motion.button>

            <div className="flex items-center gap-2 px-5 py-3 rounded-xl glass text-white/60">
              <FiMessageCircle size={18} />
              {comments.length} Comments
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-xl glass text-white/60">
              <FiEye size={18} />
              {blog.views} Views
            </div>
          </div>

          {/* Edit/Delete */}
          {(isAuthor || isAdmin) && (
            <div className="flex gap-2">
              {isAuthor && (
                <Link to={`/edit-blog/${blog._id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-white/70 hover:text-white transition-all">
                  <FiEdit size={16} /> Edit
                </Link>
              )}
              <button onClick={handleDeleteBlog}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <FiTrash2 size={16} /> Delete
              </button>
            </div>
          )}
        </motion.div>

        {/* Comments Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            Comments
            <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
              {comments.length}
            </span>
          </h3>

          {/* Add Comment */}
          {user ? (
            <form onSubmit={handleComment} className="mb-10">
              <div className="flex gap-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl glass text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition resize-none"
                  />
                  <motion.button
                    type="submit"
                    disabled={commenting || !commentText.trim()}
                    whileHover={{ scale: 1.02 }}
                                        className="mt-3 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold disabled:opacity-50 transition-all shadow-glow-sm hover:shadow-glow-md"
                  >
                    {commenting ? 'Posting...' : 'Post Comment'}
                  </motion.button>
                </div>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-10 p-6 glass rounded-2xl text-center"
            >
              <p className="text-white/60 mb-3">Join the conversation</p>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:shadow-glow-md transition-all">
                <FiUser size={18} /> Login to Comment
              </Link>
            </motion.div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 glass rounded-2xl"
              >
                <span className="text-6xl mb-4 block">💬</span>
                <p className="text-white/60">No comments yet. Be the first!</p>
              </motion.div>
            ) : (
              comments.map((comment, index) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 glass rounded-2xl"
                >
                  <div className="flex gap-4">
                    {comment.author?.avatar ? (
                      <img src={comment.author.avatar} alt={comment.author.username}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.author?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{comment.author?.username}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                          {(user?._id === comment.author?._id || isAdmin) && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                                                            onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-400/60 hover:text-red-400 transition-colors"
                            >
                              <FiTrash2 size={14} />
                            </motion.button>
                          )}
                        </div>
                      </div>
                      <p className="text-white/80 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
      </article>
    </div>
  );
};

export default BlogDetail;