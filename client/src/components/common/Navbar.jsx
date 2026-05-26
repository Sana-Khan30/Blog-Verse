import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  FiSun, FiMoon, FiMenu, FiX,
  FiEdit, FiUser, FiLogOut, FiLogIn,
  FiHome, FiTrendingUp, FiPlus,
  FiChevronDown, FiBookmark, FiSearch,
  FiZap
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LiveSearch from '../interactive/LiveSearch.jsx';

const Navbar = () => {
  const { user, logout }          = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [searchParams]            = useSearchParams();

  const [menuOpen, setMenuOpen]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [mousePos, setMousePos]         = useState({ x: 0, y: 0 });
  const dropdownRef = useRef(null);
  const navRef      = useRef(null);

  const isTrending = location.pathname === '/' && searchParams.get('sortBy') === 'popular';
  const isHome     = location.pathname === '/';

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Mouse tracking for nav glow effect ── */
  useEffect(() => {
    const onMove = (e) => {
      if (!navRef.current) return;
      const r = navRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top)  / r.height) * 100,
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── Close panels on route change ── */
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out! 👋');
    navigate('/');
  };

  const goToTrending = () => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      navigate('/?sortBy=popular', { replace: true });
      setTimeout(() => {
        document.getElementById('stories-section')?.scrollIntoView({
          behavior: 'smooth', block: 'start',
        });
      }, 80);
    } else {
      navigate('/?sortBy=popular');
      setTimeout(() => {
        document.getElementById('stories-section')?.scrollIntoView({
          behavior: 'smooth', block: 'start',
        });
      }, 400);
    }
  };

  /* ── Nav link base style ── */
  const linkBase = {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '7px 14px', borderRadius: 10,
    fontSize: 13.5, fontWeight: 500,
    background: 'transparent',
    color: 'var(--text-2)',
    border: 'none', cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease',
    whiteSpace: 'nowrap', textDecoration: 'none',
    position: 'relative',
  };

  const linkActive = {
    background: 'rgba(124,58,237,0.1)',
    color: 'var(--violet)',
  };

  return (
    <>
      {/* ── Gradient accent line ── */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 2, zIndex: 9999,
          background: 'linear-gradient(90deg, var(--violet), #a78bfa, var(--cyan), var(--violet))',
          backgroundSize: '200% 100%',
          animation: 'gradShift 4s linear infinite',
        }}
      />
      <style>{`
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .nav-link-hover:hover {
          background: var(--bg-3) !important;
          color: var(--text) !important;
        }
        .nav-icon-btn:hover {
          border-color: var(--border-2) !important;
          color: var(--text) !important;
          background: var(--bg-3) !important;
        }
      `}</style>

      <motion.nav
        ref={navRef}
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 2, left: 0, right: 0,
          zIndex: 1000,
          transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
          ...(scrolled ? {
            background: 'var(--glass-bg)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(28px) saturate(200%)',
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
            boxShadow: '0 1px 40px rgba(0,0,0,0.07)',
          } : {
            background: 'transparent',
            borderBottom: '1px solid transparent',
            backdropFilter: 'none',
            boxShadow: 'none',
          }),
        }}
      >
        {/* Subtle mouse-follow glow on scrolled nav */}
        {scrolled && (
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              background: `radial-gradient(circle 300px at ${mousePos.x}% ${mousePos.y}%, rgba(124,58,237,0.06), transparent 70%)`,
              transition: 'background 0.1s linear',
            }}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

            {/* ── Logo ── */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.12 }}
                transition={{ duration: 0.55, ease: [0.16,1,0.3,1] }}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px var(--glow)',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 17, lineHeight: 1 }}>✦</span>
              </motion.div>
              <span className="hidden sm:block" style={{
                fontSize: 19, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1,
              }}>
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, var(--violet-2), var(--cyan))',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Blog</span>
                <span style={{ color: 'var(--text)' }}>Verse</span>
              </span>
            </Link>

            {/* ── Desktop nav links ── */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hidden md:flex">

              {/* Home */}
              <Link
                to="/"
                className="nav-link-hover"
                style={{ ...linkBase, ...(isHome && !isTrending ? linkActive : {}) }}
              >
                <FiHome size={14} />
                Home
                {isHome && !isTrending && (
                  <motion.span
                    layoutId="nav-active-dot"
                    style={{
                      position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                      width: 3, height: 3, borderRadius: '50%',
                      background: 'var(--violet)',
                    }}
                  />
                )}
              </Link>

              {/* Trending */}
              <motion.button
                onClick={goToTrending}
                className="nav-link-hover"
                style={{ ...linkBase, ...(isTrending ? linkActive : {}) }}
              >
                <FiTrendingUp size={14} />
                Trending
                {isTrending && (
                  <motion.span
                    layoutId="nav-active-dot"
                    style={{
                      position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                      width: 3, height: 3, borderRadius: '50%',
                      background: 'var(--violet)',
                    }}
                  />
                )}
              </motion.button>

              {user && (
                <motion.button
                  onClick={() => navigate('/dashboard?tab=bookmarks')}
                  className="nav-link-hover"
                  style={linkBase}
                >
                  <FiBookmark size={14} />
                  Saved
                </motion.button>
              )}
            </nav>

            {/* ── Right actions ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="nav-icon-btn"
                style={{
                  padding: '9px', borderRadius: 10,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <FiSearch size={16} />
              </motion.button>

              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{
                  padding: '9px', borderRadius: 10,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--violet)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div key="sun"
                      initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                      animate={{ rotate: 0,   scale: 1,   opacity: 1 }}
                      exit={{    rotate:  90, scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ color: '#f59e0b', display: 'flex' }}
                    >
                      <FiSun size={16} />
                    </motion.div>
                  ) : (
                    <motion.div key="moon"
                      initial={{ rotate:  90, scale: 0.5, opacity: 0 }}
                      animate={{ rotate:  0,  scale: 1,   opacity: 1 }}
                      exit={{    rotate: -90, scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ color: 'var(--violet)', display: 'flex' }}
                    >
                      <FiMoon size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Write / Login CTA */}
              {user ? (
                <Link to="/create-blog" className="hidden sm:block" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(124,58,237,0.5)' }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      position: 'relative',
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                      color: '#fff', fontSize: 13.5, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 16px var(--glow)',
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                      style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        transform: 'skewX(-20deg)',
                      }}
                    />
                    <FiZap size={13} />
                    Write
                  </motion.button>
                </Link>
              ) : (
                <Link to="/login" className="hidden sm:block" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border-2)',
                      color: 'var(--text)',
                      fontSize: 13.5, fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--violet)';
                      e.currentTarget.style.color = 'var(--violet)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-2)';
                      e.currentTarget.style.color = 'var(--text)';
                    }}
                  >
                    <FiLogIn size={14} /> Login
                  </motion.button>
                </Link>
              )}

              {/* User dropdown */}
              {user ? (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setDropdownOpen(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 5px 5px 5px', borderRadius: 10,
                      background: 'var(--bg-2)',
                      border: dropdownOpen
                        ? '1px solid var(--violet)'
                        : '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: dropdownOpen ? '0 0 0 3px var(--glow)' : 'none',
                    }}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        style={{ width: 26, height: 26, borderRadius: 7, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: 26, height: 26, borderRadius: 7,
                        background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 11,
                      }}>
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <motion.div
                      animate={{ rotate: dropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ marginRight: 2, color: 'var(--text-3)', display: 'flex' }}
                    >
                      <FiChevronDown size={12} />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: -6 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        exit={{    opacity: 0, scale: 0.93, y: -6 }}
                        transition={{ duration: 0.18, ease: [0.16,1,0.3,1] }}
                        style={{
                          position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                          width: 232, borderRadius: 14,
                          overflow: 'hidden', zIndex: 9999,
                          background: 'var(--surface)',
                          border: '1px solid var(--border-2)',
                          backdropFilter: 'blur(28px)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(124,58,237,0.04)',
                        }}
                      >
                        {/* User info header */}
                        <div style={{
                          padding: '14px 16px',
                          borderBottom: '1px solid var(--border)',
                          background: 'linear-gradient(135deg, rgba(124,58,237,0.07), transparent)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 9,
                              background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 800, fontSize: 13,
                              overflow: 'hidden', flexShrink: 0,
                            }}>
                              {user.avatar
                                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : user.username[0].toUpperCase()
                              }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontWeight: 700, color: 'var(--text)', fontSize: 13.5,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                marginBottom: 1,
                              }}>
                                {user.username}
                              </p>
                              <p style={{
                                fontSize: 11.5, color: 'var(--text-3)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div style={{ padding: '6px 0' }}>
                          {[
                            { to: '/dashboard', icon: FiUser,     label: 'Dashboard' },
                            { to: '/profile',   icon: FiBookmark, label: 'My Profile' },
                          ].map(item => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setDropdownOpen(false)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '9px 16px', fontSize: 13.5,
                                color: 'var(--text-2)',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--bg-3)';
                                e.currentTarget.style.color = 'var(--text)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-2)';
                              }}
                            >
                              <item.icon size={14} style={{ opacity: 0.7 }} />
                              {item.label}
                            </Link>
                          ))}

                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '9px 16px', fontSize: 13.5,
                                color: 'var(--violet)',
                                textDecoration: 'none',
                                transition: 'background 0.15s ease',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <span style={{ fontSize: 13 }}>⚙️</span> Admin Panel
                            </Link>
                          )}
                        </div>

                        <div style={{ padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                          <button
                            onClick={handleLogout}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '9px 16px', fontSize: 13.5,
                              color: '#ef4444',
                              background: 'transparent', border: 'none',
                              cursor: 'pointer', width: '100%',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <FiLogOut size={14} style={{ opacity: 0.8 }} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/register" className="hidden sm:block" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(124,58,237,0.5)' }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
                      color: '#fff', fontSize: 13.5, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 16px var(--glow)',
                    }}
                  >
                    Join Free
                  </motion.button>
                </Link>
              )}

              {/* Mobile hamburger */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden"
                style={{
                  padding: '9px', borderRadius: 10,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <AnimatePresence mode="wait">
                  {menuOpen ? (
                    <motion.div key="x"
                      initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                      animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                      exit={{    rotate:  90, opacity: 0, scale: 0.7  }}
                      transition={{ duration: 0.18 }}
                    >
                      <FiX size={17} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu"
                      initial={{ rotate:  90, opacity: 0, scale: 0.7 }}
                      animate={{ rotate:  0,  opacity: 1, scale: 1   }}
                      exit={{    rotate: -90, opacity: 0, scale: 0.7  }}
                      transition={{ duration: 0.18 }}
                    >
                      <FiMenu size={17} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0,   scaleY: 1    }}
              exit={{    opacity: 0, y: -10, scaleY: 0.95  }}
              transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }}
              style={{
                margin: '6px 12px 0',
                borderRadius: 14,
                overflow: 'hidden',
                background: 'var(--surface)',
                border: '1px solid var(--border-2)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                transformOrigin: 'top center',
              }}
            >
              {[
                { label: 'Home',      icon: FiHome,       action: () => { navigate('/'); setMenuOpen(false); } },
                { label: 'Trending',  icon: FiTrendingUp, action: goToTrending,
                  active: isTrending },
                ...(user ? [
                  { label: 'Write Blog', icon: FiEdit,
                    action: () => { navigate('/create-blog'); setMenuOpen(false); } },
                  { label: 'Dashboard',  icon: FiUser,
                    action: () => { navigate('/dashboard'); setMenuOpen(false); } },
                  { label: 'Saved',      icon: FiBookmark,
                    action: () => { navigate('/dashboard?tab=bookmarks'); setMenuOpen(false); } },
                ] : []),
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '11px 16px', fontSize: 14,
                    color: item.active ? 'var(--violet)' : 'var(--text-2)',
                    background: item.active ? 'rgba(124,58,237,0.08)' : 'transparent',
                    border: 'none', cursor: 'pointer', width: '100%',
                    fontWeight: item.active ? 600 : 400,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!item.active) {
                      e.currentTarget.style.background = 'var(--bg-3)';
                      e.currentTarget.style.color = 'var(--text)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!item.active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-2)';
                    }
                  }}
                >
                  <item.icon size={15} />
                  {item.label}
                </motion.button>
              ))}

              {/* Divider + theme + auth */}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 2 }}>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  onClick={() => { toggleTheme(); setMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '11px 16px', fontSize: 14,
                    color: 'var(--text-2)',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', width: '100%',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {darkMode
                    ? <FiSun size={15} style={{ color: '#f59e0b' }} />
                    : <FiMoon size={15} style={{ color: 'var(--violet)' }} />
                  }
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </motion.button>

                {user ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11,
                      padding: '11px 16px', fontSize: 14,
                      color: '#ef4444',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', width: '100%',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <FiLogOut size={15} />
                    Logout
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => { navigate('/login'); setMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11,
                      padding: '11px 16px', fontSize: 14,
                      color: 'var(--text-2)',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', width: '100%',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FiLogIn size={15} />
                    Login
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Live Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <LiveSearch onClose={() => setSearchOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;