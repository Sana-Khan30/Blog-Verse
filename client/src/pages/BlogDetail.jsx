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
  FiShare2, FiCheck, FiUser, FiCopy
} from 'react-icons/fi';

/* ══════════════════════════════════════════
   HIGHLIGHT TOOLTIP COMPONENT
   (Fixed: was named HighlightTool but used as HighlightTooltip)
══════════════════════════════════════════ */
const HighlightTooltip = () => {
  const [visible, setVisible]           = useState(false);
  const [position, setPosition]         = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleSelection = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 2) {
          const range = selection.getRangeAt(0);
          const rect  = range.getBoundingClientRect();

          const x = Math.min(
            rect.left + rect.width / 2,
            window.innerWidth - 160
          );
          const y = rect.top + window.scrollY - 55;

          setPosition({ x: Math.max(x, 80), y });
          setSelectedText(text);
          setVisible(true);
        } else {
          setVisible(false);
          setSelectedText('');
        }
      }, 10);
    };

    const handleClick = (e) => {
      if (e.target.closest('.highlight-toolbar')) return;
      if (!window.getSelection()?.toString().trim()) {
        setVisible(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  if (!visible || !selectedText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="highlight-toolbar"
      style={{
        position:  'absolute',
        left:      position.x,
        top:       position.y,
        transform: 'translateX(-50%)',
        zIndex:    9999,
        display:   'flex',
        alignItems: 'center',
        gap: 1,
        borderRadius: '12px',
        padding: '4px 6px',
        background: 'rgba(17,17,24,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        pointerEvents: 'all',
      }}
    >
      {/* Copy */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          navigator.clipboard.writeText(selectedText);
          toast.success('Copied!', { icon: '📋' });
          setVisible(false);
          window.getSelection()?.removeAllRanges();
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8,
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.75)',
          fontSize: 12, fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
        }}
      >
        <FiCopy size={13} />
        Copy
      </motion.button>

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

      {/* Quote */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          navigator.clipboard.writeText(`"${selectedText}"`);
          toast.success('Quote copied!', { icon: '💬' });
          setVisible(false);
          window.getSelection()?.removeAllRanges();
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8,
          background: 'none', border: 'none',
          color: '#a78bfa',
          fontSize: 12, fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
          e.currentTarget.style.color = '#c4b5fd';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = '#a78bfa';
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1 }}>"</span>
        Quote
      </motion.button>

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

      {/* Share */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={async () => {
          try {
            if (navigator.share) {
              await navigator.share({ text: selectedText, url: window.location.href });
            } else {
              await navigator.clipboard.writeText(`"${selectedText}" — ${window.location.href}`);
              toast.success('Link + quote copied!');
            }
          } catch {}
          setVisible(false);
          window.getSelection()?.removeAllRanges();
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8,
          background: 'none', border: 'none',
          color: '#67e8f9',
          fontSize: 12, fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(6,182,212,0.1)';
          e.currentTarget.style.color = '#a5f3fc';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = '#67e8f9';
        }}
      >
        <FiShare2 size={13} />
        Share
      </motion.button>

      {/* Arrow */}
      <div style={{
        position: 'absolute',
        bottom: -5, left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: 10, height: 10,
        background: 'rgba(17,17,24,0.97)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }} />
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>

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

      {/* ── Highlight Tooltip ── */}
      {/* 
        Fixed: 
        1. Removed the broken wrapper div with pointerEvents none 
           (it was blocking tooltip interactions)
        2. HighlightTooltip now manages its own absolute positioning
           using window.scrollY so it stays on content, not viewport
        3. Removed dead useTextHighlight hook usage
      */}
      <AnimatePresence>
        <HighlightTooltip />
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
                  background: bookmarked ? 'rgba(124,58,237,0.1)' : 'var(--bg-2)',
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
                cursor: 'default',
              }}>
                #{tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* ── Article Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            marginBottom: 48,
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                background: liked ? 'rgba(239,68,68,0.1)' : 'var(--bg-2)',
                border: liked ? '1px solid rgba(239,68,68,0.25)' : '1px solid var(--border)',
                color: liked ? '#ef4444' : 'var(--text-2)',
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <FiHeart size={17} style={{ fill: liked ? '#ef4444' : 'none' }} />
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </motion.button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)', fontSize: 14,
            }}>
              <FiMessageCircle size={17} />
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)', fontSize: 14,
            }}>
              <FiEye size={17} />
              {blog.views || 0}
            </div>
          </div>

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

          {user ? (
            <form onSubmit={handleComment} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username}
                    style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
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
                      width: '100%', padding: '14px 18px', borderRadius: 14,
                      background: 'var(--bg-2)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: 14, lineHeight: 1.6,
                      resize: 'vertical', outline: 'none', fontFamily: 'inherit',
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
                      marginTop: 10, padding: '10px 24px', borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                      color: '#fff', fontSize: 14, fontWeight: 700,
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
                marginBottom: 32, padding: '28px 24px', borderRadius: 16,
                background: 'var(--bg-2)', border: '1px solid var(--border)',
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
                  textDecoration: 'none', boxShadow: '0 4px 15px var(--glow)',
                }}
              >
                <FiUser size={16} /> Login to Comment
              </Link>
            </motion.div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center', padding: '48px 24px', borderRadius: 16,
                  background: 'var(--bg-2)', border: '1px solid var(--border)',
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
                    padding: '18px 20px', borderRadius: 16,
                    background: 'var(--bg-2)', border: '1px solid var(--border)',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    {comment.author?.avatar ? (
                      <img src={comment.author.avatar} alt={comment.author.username}
                        style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
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
                        justifyContent: 'space-between', marginBottom: 6,
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
                                color: 'var(--text-3)', cursor: 'pointer',
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
                      <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
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
