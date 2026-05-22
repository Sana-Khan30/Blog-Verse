import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  FiSun, FiMoon, FiMenu, FiX,
  FiEdit, FiUser, FiLogOut, FiLogIn,
  FiHome, FiTrendingUp, FiPlus,
  FiChevronDown, FiBookmark, FiSearch
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LiveSearch from '../interactive/LiveSearch.jsx';

const Navbar = () => {
  const { user, logout }          = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [menuOpen, setMenuOpen]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const dropdownRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
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

  // ── Trending navigate karo with filter ──
  const goToTrending = () => {
    navigate('/?sortBy=popular');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[9999] bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400" />

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
        className={`fixed top-[2px] left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 dark:bg-[rgba(10,10,15,0.92)] backdrop-blur-2xl border-b border-black/5 dark:border-white/5 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* ── Logo ── */}
            <Link to="/" className="group flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30"
              >
                <span className="text-white font-black text-lg">✦</span>
              </motion.div>
              <span className="text-xl font-black tracking-tight hidden sm:block">
                <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                  Blog
                </span>
                <span className="text-slate-800 dark:text-white/90">Verse</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/')
                    ? 'bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300'
                    : 'text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <FiHome size={15} /> Home
              </Link>

              {/* ── TRENDING FIX ── */}
              <button
                onClick={goToTrending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <FiTrendingUp size={15} /> Trending
              </button>

              {user && (
                <button
                  onClick={() => navigate('/dashboard?tab=bookmarks')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <FiBookmark size={15} /> Saved
                </button>
              )}
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2">

              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <FiSearch size={17} />
              </motion.button>

              {/* ── THEME TOGGLE FIX ── */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                onClick={toggleTheme}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 hover:border-violet-300 dark:hover:border-violet-500/30 text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div key="sun"
                      initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                      animate={{ rotate: 0,   scale: 1,   opacity: 1 }}
                      exit={{    rotate:  90, scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <FiSun size={17} className="text-amber-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon"
                      initial={{ rotate:  90, scale: 0.5, opacity: 0 }}
                      animate={{ rotate:  0,  scale: 1,   opacity: 1 }}
                      exit={{    rotate: -90, scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <FiMoon size={17} className="text-violet-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Write / Login */}
              {user ? (
                <Link to="/create-blog" className="hidden sm:block">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all"
                  >
                    <FiPlus size={15} /> Write
                  </motion.button>
                </Link>
              ) : (
                <Link to="/login" className="hidden sm:block">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-transparent dark:bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-sm font-semibold backdrop-blur-md transition-all duration-300"
                  >
                    <FiLogIn size={15} /> Login
                  </motion.button>
                </Link>
              )}

              {/* User Dropdown */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                                        onClick={() => setDropdownOpen(v => !v)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username}
                        className="w-7 h-7 rounded-lg object-cover ring-2 ring-violet-500/30" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <FiChevronDown size={13}
                      className={`text-slate-400 dark:text-white/40 mr-0.5 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        exit={{    opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }}
                        className="absolute right-0 mt-3 w-60 rounded-2xl overflow-hidden z-50 shadow-2xl"
                        style={{
                          background: darkMode
                            ? 'rgba(17,17,24,0.97)'
                            : 'rgba(255,255,255,0.97)',
                          border: darkMode
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(0,0,0,0.08)',
                          backdropFilter: 'blur(20px)',
                        }}
                      >
                        {/* User header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/6 bg-gradient-to-r from-violet-50 dark:from-violet-500/6 to-transparent">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                              {user.avatar
                                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                : user.username[0].toUpperCase()
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                                {user.username}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-white/35 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          {[
                            { to: '/dashboard', icon: FiUser,     label: 'Dashboard' },
                            { to: '/profile',   icon: FiBookmark, label: 'My Profile' },
                          ].map(item => (
                            <Link key={item.to} to={item.to}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <item.icon size={15} /> {item.label}
                            </Link>
                          ))}

                          {user.role === 'admin' && (
                            <Link to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/6 transition-colors"
                            >
                              <span>⚙️</span> Admin Panel
                            </Link>
                          )}
                        </div>

                        <div className="py-2 border-t border-slate-100 dark:border-white/6">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-red-500 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/8 transition-colors w-full"
                          >
                            <FiLogOut size={15} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/register" className="hidden sm:block">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all"
                  >
                    Join Free
                  </motion.button>
                </Link>
              )}

              {/* Mobile hamburger */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-500 dark:text-white/60 transition-all"
              >
                <AnimatePresence mode="wait">
                  {menuOpen ? (
                    <motion.div key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0,   opacity: 1 }}
                      exit={{    rotate:  90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <FiX size={18} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu"
                      initial={{ rotate:  90, opacity: 0 }}
                      animate={{ rotate:  0,  opacity: 1 }}
                      exit={{    rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <FiMenu size={18} />
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
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0   }}
              exit={{    opacity: 0, y: -12  }}
              transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }}
              className="md:hidden mx-4 mt-2 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: darkMode
                  ? 'rgba(17,17,24,0.97)'
                  : 'rgba(255,255,255,0.97)',
                border: darkMode
                  ? '1px solid rgba(255,255,255,0.07)'
                  : '1px solid rgba(0,0,0,0.08)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div className="py-3 px-4 space-y-0.5">
                <Link to="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <FiHome size={16} /> Home
                </Link>

                {/* Mobile Trending */}
                <button
                  onClick={goToTrending}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors w-full text-left"
                >
                  <FiTrendingUp size={16} /> Trending
                </button>

                {user && (
                  <>
                    <Link to="/create-blog"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <FiEdit size={16} /> Write Blog
                    </Link>
                    <Link to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <FiUser size={16} /> Dashboard
                    </Link>
                  </>
                )}

                {/* Mobile Theme Toggle */}
                <button
                  onClick={() => { toggleTheme(); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors w-full"
                >
                  {darkMode
                    ? <FiSun size={16} className="text-amber-400" />
                    : <FiMoon size={16} className="text-violet-600" />
                  }
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>

                {user ? (
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/8 transition-colors w-full"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                ) : (
                  <Link to="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiLogIn size={16} /> Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Live Search */}
      <AnimatePresence>
        {searchOpen && (
          <LiveSearch onClose={() => setSearchOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;