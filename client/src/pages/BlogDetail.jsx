import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getBlogBySlug, toggleLike, deleteBlog } from '../api/blogApi.js';
import { getComments, addComment, deleteComment } from '../api/commentApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  FiHeart, FiMessageCircle, FiEye, FiTrash2,
  FiEdit, FiArrowLeft, FiBookmark,
  FiShare2, FiCheck, FiUser, FiCopy, FiTwitter
} from 'react-icons/fi';

/* ══════════════════════════════════════════
   TEXT HIGHLIGHT HOOK
   Detects user text selection inside article
══════════════════════════════════════════ */
const useTextHighlight = (containerRef) => {
  const [highlight, setHighlight] = useState(null);
  // highlight = { text, x, y } | null

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setHighlight(null);
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length < 3) { setHighlight(null); return; }

      // Make sure selection is inside our article container
      if (!containerRef.current) return;
      const range = selection.getRangeAt(0);
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        setHighlight(null);
        return;
      }

      // Position tooltip above the selection
      const rect = range.getBoundingClientRect();
      setHighlight({
        text: selectedText,
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 12,
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [containerRef]);

  const clearHighlight = useCallback(() => {
    setHighlight(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return { highlight, clearHighlight };
};

/* ══════════════════════════════════════════
   HIGHLIGHT TOOLTIP COMPONENT
══════════════════════════════════════════ */
const HighlightTooltip = ({ highlight, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyQuote = async () => {
    try {
      await navigator.clipboard.writeText(`"${highlight.text}"`);
      setCopied(true);
      toast.success('Quote copied!', { icon: '📋' });
      setTimeout(() => { setCopied(false); onClose(); }, 1200);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const tweetQuote = () => {
    const tweet = encodeURIComponent(
      `"${highlight.text.slice(0, 200)}"\n\n— via ${window.location.href}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.92 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute',
        left: highlight.x,
        top: highlight.y,
        transform: 'translateX(-50%) translateY(-100%)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 8px',
        borderRadius: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border-2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(124,58,237,0.1)',
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
      }}
    >
      {/* Arrow */}
      <div style={{
        position: 'absolute',
        bottom: -5, left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: 10, height: 10,
        background: 'var(--surface)',
        border: '1px solid var(--border-2)',
        borderTop: 'none', borderLeft: 'none',
      }} />

      {/* Copy quote */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={copyQuote}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 8,
          background: copied ? 'rgba(34,197,94,0.12)' : 'var(--bg-2)',
          border: '1px solid var(--border)',
          color: copied ? '#22c55e' : 'var(--text)',
          fontSize: 12, fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
        {copied ? 'Copied!' : 'Copy'}
      </motion.button>

      {/* Tweet */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={tweetQuote}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 8,
          background: 'rgba(29,161,242,0.1)',
          border: '1px solid rgba(29,161,242,0.2)',
          color: '#1da1f2',
          fontSize: 12, fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <FiTwitter size={12} />
        Tweet
      </motion.button>

      {/* Selected text preview */}
      <div style={{
        maxWidth: 180,
        padding: '5px 10px',
        borderRadius: 8,
        background: 'rgba(124,58,237,0.08)',
        border: '1px solid rgba(124,58,237,0.15)',
        fontSize: 11,
        color: 'var(--text-2)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        "{highlight.text.slice(0, 40)}{highlight.text.length > 40 ? '…' : ''}"
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   LOADING SKELETON
══════════════════════════════════════════ */
const LoadingSkeleton = () => (
  <div style={{ maxWidth: 768, margin: '0 auto', padding: '96px 24px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[
        { width: '25%', height: 24 },
        { width: '75%', height: 48 },
        { width: '100%', height: 320, borderRadius: 24 },
        ...Array(6).fill({ width: '100%', height: 16 }),
      ].map((s, i) => (
        <div key={i} className="shimmer" style={{
          width: s.width, height: s.height,
          borderRadius: s.borderRadius || 8,
        }} />
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════
   BLOG DETAIL PAGE
══════════════════════════════════════════ */
const BlogDetail = () => {
  const { slug }   = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const articleRef = useRef(null);
  const contentRef = useRef(null);

  const [blog,         setBlog]         = useState(null);
  const [comments,     setComments]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [commentText,  setCommentText]  = useState('');
  const [commenting,   setCommenting]   = useState(false);
  const [liked,        setLiked]        = useState(false);
  const [likesCount,   setLikesCount]   = useState(0);
  const [bookmarked,   setBookmarked]   = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [copySuccess,  setCopySuccess]  = useState(false);

  /* ── Text highlight ── */
  const { highlight, clearHighlight } = useTextHighlight(contentRef);

  /* ── Reading progress ── */
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const { top, height } = articleRef.current.getBoundingClientRect();
      const progress = Math.min(100, Math.max(0,
        ((window.innerHeight - top) / (window.innerHeight + height)) * 100
      ));
      setReadProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blog]);

  /* ── Close highlight on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (highlight && !e.target.closest('[data-highlight-tooltip]')) {
        clearHighlight();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [highlight, clearHighlight]);

  const fetchBlog = useCallback(async () => {
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
  }, [slug, user, navigate]);

  useEffect(() => { fetchBlog(); }, [fetchBlog]);

  const handleLike = async () => {
    if (!user) return toast.error('Login to like!', { icon: '🔒' });
    try {
      const { data } = await toggleLike(blog._id);
      setLiked(data.isLiked);
      setLikesCount(data.likesCount);
      if (data.isLiked) toast.success('Liked!', { icon: '❤️' });
    } catch { toast.error('Failed to like'); }
  };

  const handleBookmark = () => {
    if (!user) return toast.error('Login to bookmark!', { icon: '🔒' });
    setBookmarked(v => !v);
    toast.success(bookmarked ? 'Removed from bookmarks' : 'Bookmarked!', {
      icon: bookmarked ? '🔖' : '✨',
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${slug}`);
      setCopySuccess(true);
      toast.success('Link copied!', { icon: '🔗' });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch { toast.error('Failed to copy link'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login to comment!', { icon: '🔒' });
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const { data } = await addComment(blog._id, { content: commentText });
      setComments(prev => [data.comment, ...prev]);
      setCommentText('');
      toast.success('Comment added!', { icon: '💬' });
    } catch { toast.error('Failed to add comment'); }
    finally { setCommenting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await deleteBlog(blog._id);
      toast.success('Blog deleted!');
      navigate('/');
    } catch { toast.error('Failed to delete blog'); }
  };

  const readingTime = Math.max(1,
    Math.ceil((blog?.content || '').replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).length / 200)
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  if (loading) return <LoadingSkeleton />;
  if (!blog)   return null;

  const isAuthor = user?._id === blog.author?._id;
  const isAdmin  = user?.role === 'admin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Reading Progress Bar ── */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, height: 3,
          width: `${readProgress}%`,
          background: 'linear-gradient(90deg, var(--violet), var(--violet-2), var(--cyan))',
          boxShadow: '0 0 10px var(--glow)',
          zIndex: 9998,
          transition: 'width 0.1s linear',
        }}
      />

      {/* ── Highlight Tooltip (portal-style absolute) ── */}
      <AnimatePresence>
        {highlight && (
          <div data-highlight-tooltip style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none', zIndex: 9990 }}>
            <HighlightTooltip highlight={highlight} onClose={clearHighlight} />
          </div>
        )}
      </AnimatePresence>

      {/* ── Article ── */}
      <article
        ref={articleRef}
        style={{ maxWidth: 768, margin: '0 auto', padding: '96px 24px 48px' }}
      >

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 32,
            background: 'none', border: 'none',
            color: 'var(--text-2)', fontSize: 14,
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          <FiArrowLeft size={16} /> Back
        </motion.button>

        {/* ── Meta Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          {/* Category pill */}
          <div style={{ marginBottom: 16 }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px', borderRadius: 999,
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
              color: 'var(--violet)',
              fontSize: 13, fontWeight: 600,
            }}>
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 900, lineHeight: 1.15,
            color: 'var(--text)',
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}>
            {blog.title}
          </h1>

          {/* Author row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {blog.author?.avatar ? (
                <img src={blog.author.avatar} alt={blog.author.username}
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    objectFit: 'cover',
                    border: '2px solid rgba(124,58,237,0.25)',
                  }} />
              ) : (
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 18,
                }}>
                  {blog.author?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>
                  {blog.author?.username}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  {formatDate(blog.createdAt)} · {readingTime} min read
                </p>
              </div>
            </div>

            {/* Share + Bookmark */}
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleShare}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 12,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: copySuccess ? '#22c55e' : 'var(--text-2)',
                  fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {copySuccess ? <FiCheck size={15} /> : <FiShare2 size={15} />}
                <span className="hidden sm:inline">
                  {copySuccess ? 'Copied!' : 'Share'}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleBookmark}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 12,
                  background: bookmarked
                    ? 'rgba(124,58,237,0.1)'
                    : 'var(--bg-2)',
                  border: bookmarked
                    ? '1px solid rgba(124,58,237,0.25)'
                    : '1px solid var(--border)',
                  color: bookmarked ? 'var(--violet)' : 'var(--text-2)',
                  fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <FiBookmark size={15} style={{ fill: bookmarked ? 'var(--violet)' : 'none' }} />
                <span className="hidden sm:inline">
                  {bookmarked ? 'Saved' : 'Save'}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Cover Image ── */}
        {blog.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              borderRadius: 24, overflow: 'hidden',
              marginBottom: 40,
              border: '1px solid var(--border)',
            }}
          >
            <img
              src={blog.coverImage} alt={blog.title}
              style={{ width: '100%', height: 'clamp(280px, 40vw, 480px)', objectFit: 'cover', display: 'block' }}
            />
          </motion.div>
        )}

        {/* ── Tags ── */}
        {blog.tags?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}
          >
            {blog.tags.map(tag => (
              <span key={tag} style={{
                padding: '5px 14px', borderRadius: 999,
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                fontSize: 12, fontWeight: 500,
                color: 'var(--text-2)',
                transition: 'all 0.2s ease',
                cursor: 'default',
              }}>
                #{tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* ── Article Content (highlight target) ── */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            marginBottom: 48,
            /* Prose typography using CSS vars */
            fontSize: 17,
            lineHeight: 1.8,
            color: 'var(--text-2)',
            userSelect: 'text',
          }}
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* ── Stats + Like ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
            padding: '20px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            marginBottom: 48,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Like */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                background: liked ? 'rgba(239,68,68,0.1)' : 'var(--bg-2)',
                border: liked
                  ? '1px solid rgba(239,68,68,0.25)'
                  : '1px solid var(--border)',
                color: liked ? '#ef4444' : 'var(--text-2)',
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <FiHeart size={17} style={{ fill: liked ? '#ef4444' : 'none' }} />
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </motion.button>

            {/* Comments count */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              fontSize: 14,
            }}>
              <FiMessageCircle size={17} />
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </div>

            {/* Views */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              fontSize: 14,
            }}>
              <FiEye size={17} />
              {blog.views || 0}
            </div>
          </div>

          {/* Edit / Delete */}
          {(isAuthor || isAdmin) && (
            <div style={{ display: 'flex', gap: 8 }}>
              {isAuthor && (
                <Link to={`/edit-blog/${blog._id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 12,
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-2)',
                    fontSize: 13, textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--violet)';
                    e.currentTarget.style.color = 'var(--violet)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-2)';
                  }}
                >
                  <FiEdit size={14} /> Edit
                </Link>
              )}
              <button onClick={handleDeleteBlog}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 12,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: '#ef4444',
                  fontSize: 13, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-2)'; }}
              >
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          )}
        </motion.div>

        {/* ══════════════════════════════════════
            COMMENTS SECTION
        ══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 28,
          }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
              Comments
            </h3>
            <span style={{
              padding: '3px 12px', borderRadius: 999,
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
              color: 'var(--violet)',
              fontSize: 13, fontWeight: 600,
            }}>
              {comments.length}
            </span>
          </div>

          {/* Add comment */}
          {user ? (
            <form onSubmit={handleComment} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username}
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      objectFit: 'cover', flexShrink: 0,
                    }} />
                ) : (
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                  }}>
                    {user.username[0].toUpperCase()}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: 14,
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: 14, lineHeight: 1.6,
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--violet)';
                      e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <motion.button
                    type="submit"
                    disabled={commenting || !commentText.trim()}
                    whileHover={{ scale: commenting ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      marginTop: 10,
                      padding: '10px 24px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                      color: '#fff',
                      fontSize: 14, fontWeight: 700,
                      border: 'none', cursor: commenting ? 'not-allowed' : 'pointer',
                      opacity: (commenting || !commentText.trim()) ? 0.5 : 1,
                      boxShadow: '0 4px 15px var(--glow)',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {commenting ? 'Posting…' : 'Post Comment'}
                  </motion.button>
                </div>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginBottom: 32,
                padding: '28px 24px',
                borderRadius: 16,
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'var(--text-2)', marginBottom: 14, fontSize: 15 }}>
                Join the conversation
              </p>
              <Link to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px var(--glow)',
                }}
              >
                <FiUser size={16} /> Login to Comment
              </Link>
            </motion.div>
          )}

          {/* Comments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center', padding: '48px 24px',
                  borderRadius: 16,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>💬</span>
                <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
                  No comments yet. Be the first!
                </p>
              </motion.div>
            ) : (
              comments.map((comment, i) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 16,
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    {comment.author?.avatar ? (
                      <img src={comment.author.avatar} alt={comment.author.username}
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          objectFit: 'cover', flexShrink: 0,
                        }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 14,
                      }}>
                        {comment.author?.username?.[0]?.toUpperCase()}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>
                          {comment.author?.username}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                          {(user?._id === comment.author?._id || isAdmin) && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleDeleteComment(comment._id)}
                              style={{
                                background: 'none', border: 'none',
                                color: 'var(--text-3)',
                                cursor: 'pointer',
                                transition: 'color 0.2s ease',
                                display: 'flex', padding: 2,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
                            >
                              <FiTrash2 size={13} />
                            </motion.button>
                          )}
                        </div>
                      </div>
                      <p style={{
                        color: 'var(--text-2)', fontSize: 14,
                        lineHeight: 1.6, margin: 0,
                      }}>
                        {comment.content}
                      </p>
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