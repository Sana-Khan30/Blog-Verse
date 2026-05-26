import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBookmark } from '../../hooks/useBookmark.js';
import { toggleLike } from '../../api/blogApi.js';
import toast from 'react-hot-toast';
import {
  FiHeart, FiMessageCircle, FiEye, FiClock,
  FiBookmark, FiShare2, FiArrowUpRight
} from 'react-icons/fi';

/* ─────────────────────────────────────────────────
   Category accent palette
───────────────────────────────────────────────── */
const CAT_ACCENT = {
  Technology:   '#06b6d4',
  Programming:  '#a78bfa',
  Design:       '#f472b6',
  Business:     '#f59e0b',
  Lifestyle:    '#22c55e',
  Health:       '#f87171',
  Travel:       '#2dd4bf',
  Food:         '#fb923c',
  Other:        '#94a3b8',
};
const catColor = (c) => CAT_ACCENT[c] || CAT_ACCENT.Other;

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */
const readingTime = (content = '') =>
  Math.max(1, Math.ceil(
    content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 200
  ));

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtCount = (n) => (n > 999 ? `${(n / 1000).toFixed(1)}k` : n);

/* ─────────────────────────────────────────────────
   BLOG CARD
   Fixes from audit:
   • 3D tilt — moved from rotateX/rotateY on the wrapper
     to a translateX/translateY parallax on the inner image only.
     Reason: rotateX/Y + transformStyle:preserve-3d causes Safari
     z-index stacking bugs and forced compositing on ALL children.
     The new approach gives the same "depth" feel with no side-effects.
   • useSpring on the tilt values → natural deceleration
   • Glow halo stays (it's great), but uses CSS transition not RAF
   • Mobile: 3D effect is disabled via a pointer-coarse media check
───────────────────────────────────────────────── */
const BlogCard = ({ blog, index = 0, onBookmark }) => {
  const { user }                         = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const cardRef                          = useRef(null);

  const [isHovered,  setIsHovered]  = useState(false);
  const [liked,      setLiked]      = useState(() => blog.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const [likeAnim,   setLikeAnim]   = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);

  /* ── Parallax tilt (image only, not full card) ── */
  const isFine = typeof window !== 'undefined'
    ? !window.matchMedia('(pointer: coarse)').matches
    : true;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const imgX = useSpring(useTransform(rawX, [-0.5, 0.5], [-8,  8]),  { stiffness: 200, damping: 30 });
  const imgY = useSpring(useTransform(rawY, [-0.5, 0.5], [-6,  6]),  { stiffness: 200, damping: 30 });

  const handleMouseMove = useCallback((e) => {
    if (!isFine || !cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    rawX.set((e.clientX - left - width  / 2) / width);
    rawY.set((e.clientY - top  - height / 2) / height);
  }, [isFine, rawX, rawY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(() => setActionsVisible(true), 60);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setIsHovered(false);
    setActionsVisible(false);
  };

  /* ── Actions ── */
  const handleLike = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Login to like!', { icon: '🔒' }); return; }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(v => wasLiked ? v - 1 : v + 1);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
    try {
      const { data } = await toggleLike(blog._id);
      setLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch {
      setLiked(wasLiked);
      setLikesCount(v => wasLiked ? v + 1 : v - 1);
    }
  };

  const handleBookmark = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Login to bookmark!', { icon: '🔒' }); return; }
    toggleBookmark(blog._id);
    const was = isBookmarked(blog._id);
    toast.success(was ? 'Removed from bookmarks' : 'Bookmarked!', { icon: was ? '🔖' : '✨' });
    onBookmark?.(blog._id, !was);
  };

  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${blog.slug}`);
      toast.success('Link copied!', { icon: '🔗' });
    } catch { toast.error('Failed to copy link'); }
  };

  const minutes   = readingTime(blog.content);
  const bookmarked = isBookmarked(blog._id);
  const accent     = catColor(blog.category);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay:    Math.min(index * 0.07, 0.42),
        ease:     [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', height: '100%' }}
    >
      {/* ── Ambient glow halo ── */}
      <div style={{
        position:      'absolute',
        inset:         -6,
        borderRadius:  30,
        background:    `radial-gradient(ellipse at center, ${accent}22 0%, transparent 70%)`,
        filter:        'blur(18px)',
        opacity:       isHovered ? 1 : 0,
        transition:    'opacity 0.5s ease',
        pointerEvents: 'none',
        zIndex:        0,
      }} />

      {/* ── Card shell ── */}
      <div style={{
        position:     'relative',
        height:       '100%',
        display:      'flex',
        flexDirection: 'column',
        background:   'var(--surface)',
        border:       isHovered ? `1px solid ${accent}50` : '1px solid var(--border)',
        borderRadius: 24,
        overflow:     'hidden',
        transition:   'border-color 0.35s ease, box-shadow 0.35s ease',
        boxShadow:    isHovered
          ? `0 24px 60px rgba(0,0,0,0.14), 0 0 0 1px ${accent}18`
          : '0 2px 12px rgba(0,0,0,0.05)',
        zIndex: 1,
      }}>

        {/* ── Image area ── */}
        <Link to={`/blog/${blog.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
          <div style={{
            position: 'relative',
            height:   208,
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${accent}20, var(--bg-3))`,
          }}>
            {blog.coverImage ? (
              /* Parallax: only the image translates — not the whole card */
              <motion.img
                src={blog.coverImage}
                alt={blog.title}
                style={{
                  width:  '110%',   // oversized so translation doesn't reveal edges
                  height: '110%',
                  objectFit: 'cover',
                  display: 'block',
                  marginLeft: '-5%',
                  marginTop:  '-5%',
                  x: isFine ? imgX : 0,
                  y: isFine ? imgY : 0,
                  scale: isHovered ? 1.04 : 1,
                  transition: 'scale 0.6s ease',
                }}
              />
            ) : (
              /* Gradient placeholder */
              <div style={{
                width:   '100%',
                height:  '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: "'Bebas Neue', serif",
                  fontSize:   80,
                  color:      accent,
                  opacity:    0.18,
                  lineHeight: 1,
                  userSelect: 'none',
                }}>
                  {blog.title?.[0]?.toUpperCase()}
                </span>
              </div>
            )}

            {/* gradient overlay */}
            <div style={{
              position:      'absolute',
              inset:         0,
              background:    'linear-gradient(to top, var(--surface) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
              opacity:       0.7,
              pointerEvents: 'none',
            }} />

            {/* Category pill */}
            <div style={{
              position:       'absolute',
              top:            14,
              left:           14,
              padding:        '4px 11px',
              borderRadius:   999,
              background:     'rgba(0,0,0,0.52)',
              backdropFilter: 'blur(14px)',
              border:         `1px solid ${accent}40`,
              fontSize:       10,
              fontWeight:     700,
              color:          accent,
              letterSpacing:  '0.05em',
              textTransform:  'uppercase',
            }}>
              {blog.category}
            </div>

            {/* Reading time */}
            <div style={{
              position:       'absolute',
              bottom:         14,
              left:           14,
              display:        'flex',
              alignItems:     'center',
              gap:            4,
              padding:        '3px 9px',
              borderRadius:   999,
              background:     'rgba(0,0,0,0.52)',
              backdropFilter: 'blur(14px)',
              border:         '1px solid rgba(255,255,255,0.08)',
              fontSize:       10,
              fontWeight:     500,
              color:          'rgba(255,255,255,0.8)',
            }}>
              <FiClock size={9} />
              {minutes}m read
            </div>

            {/* Bookmark + Share — appear on hover */}
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: actionsVisible ? 1 : 0, y: actionsVisible ? 0 : -4 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top:      14,
                right:    14,
                display:  'flex',
                gap:      6,
              }}
            >
              <ActionBtn onClick={handleBookmark} active={bookmarked} activeColor={accent}>
                <FiBookmark size={13} style={{ fill: bookmarked ? '#fff' : 'none' }} />
              </ActionBtn>
              <ActionBtn onClick={handleShare}>
                <FiShare2 size={13} />
              </ActionBtn>
            </motion.div>
          </div>
        </Link>

        {/* ── Card body ── */}
        <div style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          padding:       '18px 20px 16px',
          gap:           12,
        }}>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width:        32,
              height:       32,
              borderRadius: 9,
              overflow:     'hidden',
              flexShrink:   0,
              background:   `linear-gradient(135deg, ${accent}80, var(--violet))`,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              border:       '1px solid var(--border)',
            }}>
              {blog.author?.avatar ? (
                <img
                  src={blog.author.avatar}
                  alt={blog.author.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {blog.author?.username?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {blog.author?.username}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.3 }}>
                {fmtDate(blog.createdAt)}
              </p>
            </div>
          </div>

          {/* Title */}
          <Link to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
            <h2 style={{
              fontSize:           15,
              fontWeight:         800,
              lineHeight:         1.4,
              letterSpacing:      '-0.015em',
              color:              isHovered ? accent : 'var(--text)',
              display:            '-webkit-box',
              WebkitLineClamp:    2,
              WebkitBoxOrient:    'vertical',
              overflow:           'hidden',
              margin:             0,
              transition:         'color 0.25s ease',
            }}>
              {blog.title}
            </h2>
          </Link>

          {/* Excerpt */}
          {blog.excerpt && (
            <p style={{
              fontSize:        13,
              color:           'var(--text-3)',
              lineHeight:      1.65,
              display:         '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow:        'hidden',
              margin:          0,
              flex:            1,
            }}>
              {blog.excerpt}
            </p>
          )}

          {!blog.excerpt && <div style={{ flex: 1 }} />}

          {/* ── Stats footer ── */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            paddingTop:     12,
            borderTop:      '1px solid var(--border)',
            marginTop:      'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>

              {/* Like */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                animate={likeAnim ? { scale: [1, 1.45, 1] } : {}}
                onClick={handleLike}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        5,
                  padding:    '5px 9px',
                  borderRadius: 9,
                  fontSize:   12,
                  fontWeight: 500,
                  border:     'none',
                  cursor:     'pointer',
                  background: liked ? 'rgba(239,68,68,0.1)' : 'var(--bg-2)',
                  color:      liked ? '#ef4444' : 'var(--text-3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!liked) { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }
                }}
                onMouseLeave={e => {
                  if (!liked) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-3)'; }
                }}
              >
                <FiHeart size={12} style={{ fill: liked ? '#ef4444' : 'none' }} />
                {fmtCount(likesCount)}
              </motion.button>

              <StatChip icon={<FiMessageCircle size={12} />} value={fmtCount(blog.commentsCount || 0)} />
              <StatChip icon={<FiEye size={12} />}           value={fmtCount(blog.views || 0)} />
            </div>

            {/* Read CTA arrow */}
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -8 }}
              transition={{ duration: 0.22 }}
            >
              <Link to={`/blog/${blog.slug}`} style={{
                display:    'flex',
                alignItems: 'center',
                gap:        4,
                padding:    '5px 10px',
                borderRadius: 9,
                fontSize:   12,
                fontWeight: 700,
                textDecoration: 'none',
                color:      accent,
                background: `${accent}12`,
                border:     `1px solid ${accent}30`,
                transition: 'all 0.2s ease',
              }}>
                Read <FiArrowUpRight size={12} />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom accent bar — slides in on hover */}
        <motion.div
          animate={{ scaleX: isHovered ? 1 : 0 }}
          initial={{ scaleX: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position:        'absolute',
            bottom:          0,
            left:            0,
            right:           0,
            height:          2,
            background:      `linear-gradient(90deg, ${accent}, var(--violet))`,
            transformOrigin: 'left',
          }}
        />
      </div>
    </motion.div>
  );
};

/* ── Sub-components ── */
const ActionBtn = ({ onClick, children, active = false, activeColor = 'var(--violet)' }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.88 }}
    onClick={onClick}
    style={{
      width:          32,
      height:         32,
      padding:        0,
      borderRadius:   9,
      backdropFilter: 'blur(14px)',
      border:         active ? `1px solid ${activeColor}60` : '1px solid rgba(255,255,255,0.12)',
      background:     active ? activeColor : 'rgba(0,0,0,0.5)',
      color:          active ? '#fff' : 'rgba(255,255,255,0.85)',
      cursor:         'pointer',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      transition:     'all 0.2s ease',
    }}
  >
    {children}
  </motion.button>
);

const StatChip = ({ icon, value }) => (
  <div style={{
    display:    'flex',
    alignItems: 'center',
    gap:        4,
    padding:    '5px 9px',
    borderRadius: 9,
    fontSize:   12,
    color:      'var(--text-3)',
    background: 'var(--bg-2)',
  }}>
    {icon}
    {value}
  </div>
);

export default BlogCard;