import { motion, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBookmark } from "../../hooks/useBookmark.js";
import { toggleLike } from "../../api/blogApi.js";
import toast from "react-hot-toast";
import {
  FiHeart, FiMessageCircle, FiEye, FiClock,
  FiBookmark, FiShare2, FiArrowUpRight
} from "react-icons/fi";

const BlogCard = ({ blog, index = 0, onBookmark }) => {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const cardRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(() => blog.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const [likeAnim, setLikeAnim] = useState(false);

  // 3D tilt values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Login to like blogs!', { icon: '🔒' });
      return;
    }
    setLiked(v => !v);
    setLikesCount(v => liked ? v - 1 : v + 1);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);

    try {
      const { data } = await toggleLike(blog._id);
      setLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch {
      setLiked(v => !v);
      setLikesCount(v => liked ? v + 1 : v - 1);
    }
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Login to bookmark!', { icon: '🔒' });
      return;
    }
    toggleBookmark(blog._id);
    const currentlyBookmarked = isBookmarked(blog._id);
    toast.success(currentlyBookmarked ? 'Removed from bookmarks' : 'Bookmarked!', {
      icon: currentlyBookmarked ? '🔖' : '✨',
    });
    onBookmark?.(blog._id, !currentlyBookmarked);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${blog.slug}`);
      toast.success('Link copied!', { icon: '🔗' });
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleMouseEnter = () => setIsHovered(true);

  const readingTime = Math.max(1, Math.ceil((blog.content || '').replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).length / 200));

  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const bookmarked = isBookmarked(blog._id);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-0 transition-opacity duration-500 ${
          isHovered ? 'opacity-25' : 'opacity-0'
        }`}
      />

      <div
        className={`relative h-full glass-dark rounded-3xl overflow-hidden transition-all duration-500 border ${
          isHovered ? 'border-violet-500/30' : 'border-white/5'
        }`}
      >
        {/* Cover Image */}
        <Link to={`/blog/${blog.slug}`} className="block">
          <div className="relative h-52 overflow-hidden bg-gradient-to-br from-violet-900/50 to-gray-900">
            {blog.coverImage ? (
              <motion.img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
                animate={{ scale: isHovered ? 1.08 : 1 }}
                transition={{ duration: 0.6 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl opacity-30">✦</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />

            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index || 0) * 0.1 + 0.2 }}
              className="absolute top-4 left-4"
            >
              <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl text-xs font-semibold text-white border border-white/15">
                {blog.category}
              </span>
            </motion.div>

            {/* Reading time */}
            <div className="absolute bottom-4 left-4">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white/70 border border-white/10">
                <FiClock size={10}/>{readingTime}m
              </span>
            </div>

            {/* Actions overlay on hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 right-4 flex gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                                onClick={handleBookmark}
                className={`p-2.5 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
                  bookmarked
                    ? 'bg-violet-500/80 border-violet-400 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-black/40 border-white/20 text-white/80 hover:bg-black/50'
                }`}
              >
                <FiBookmark size={15} className={bookmarked ? 'fill-white' : ''} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                                onClick={handleShare}
                className="p-2.5 rounded-xl bg-black/40 backdrop-blur-xl border border-white/20 text-white/80 hover:bg-black/50 transition-all duration-300"
              >
                <FiShare2 size={15} />
              </motion.button>
            </motion.div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Author + Date */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index || 0) * 0.1 + 0.3 }}
            className="flex items-center gap-3"
          >
            {blog.author?.avatar ? (
              <img
                src={blog.author.avatar}
                alt={blog.author.username}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-violet-500/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {blog.author?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">
                {blog.author?.username}
              </p>
              <p className="text-xs text-white/50">
                {formatDate(blog.createdAt)}
              </p>
            </div>
          </motion.div>

          {/* Title */}
          <Link to={`/blog/${blog.slug}`}>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index || 0) * 0.1 + 0.4 }}
              className="text-lg font-bold text-white line-clamp-2 group-hover:text-violet-300 transition-colors duration-300"
            >
              {blog.title}
            </motion.h2>
          </Link>

          {/* Excerpt */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index || 0) * 0.1 + 0.5 }}
            className="text-sm text-white/60 line-clamp-2 leading-relaxed"
          >
            {blog.excerpt}
          </motion.p>

          {/* Footer Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index || 0) * 0.1 + 0.6 }}
            className="flex items-center justify-between pt-4 border-t border-white/5"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                                animate={likeAnim ? { scale: [1, 1.4, 1] } : {}}
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  liked
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-white/60 hover:bg-red-500/10 hover:text-red-400'
                }`}
              >
                <FiHeart size={14} className={liked ? 'fill-red-500' : ''} />
                <span>{likesCount}</span>
              </motion.button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-white/60">
                <FiMessageCircle size={14} />
                <span>{blog.commentsCount || 0}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-white/60">
                <FiEye size={14} />
                <span>{blog.views || 0}</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={`/blog/${blog.slug}`}
                className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Read <FiArrowUpRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #06b6d4)',
            padding: '2px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          }}
        />
      </div>
    </motion.div>
  );
};

export default BlogCard;