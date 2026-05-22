import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiTrendingUp, FiClock } from 'react-icons/fi';
import { getAllBlogs } from '../../api/blogApi.js';

const TRENDING = ['React', 'JavaScript', 'MERN', 'Design', 'Technology'];

const LiveSearch = ({ onClose }) => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [recent, setRecent]     = useState(
    JSON.parse(localStorage.getItem('recentSearches') || '[]')
  );
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    fetchBlogs();
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data } = await getAllBlogs({ limit: 100 });
      setAllBlogs(data.blogs || []);
    } catch {}
  };

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const filtered = allBlogs.filter(b =>
      b.title?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      b.tags?.some(t => t.toLowerCase().includes(q))
    ).slice(0, 6);
    setResults(filtered);
  }, [query, allBlogs]);

  const handleSelect = (blog) => {
    const newRecent = [query, ...recent.filter(r => r !== query)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    navigate(`/blog/${blog.slug}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(17,17,24,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Input */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
          <FiSearch className="text-violet-400 flex-shrink-0" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search blogs, topics, categories..."
            className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/20"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/30 hover:text-white transition">
              <FiX size={18} />
            </button>
          )}
          <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-white/30">ESC</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-3">
              <p className="text-xs text-white/30 px-3 py-2 uppercase tracking-widest">
                Results ({results.length})
              </p>
              {results.map((blog, i) => (
                <motion.button
                  key={blog._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelect(blog)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition text-left"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {blog.coverImage
                      ? <img src={blog.coverImage} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">📝</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{blog.title}</p>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{blog.excerpt}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-violet-500/10 text-violet-400 rounded-lg flex-shrink-0">
                    {blog.category}
                  </span>
                </motion.button>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-white/30">
              <p className="text-4xl mb-3">🔍</p>
              <p>No results for "<span className="text-white">{query}</span>"</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {recent.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 px-3 py-2 flex items-center gap-2 uppercase tracking-widest">
                    <FiClock size={12} /> Recent
                  </p>
                  <div className="flex flex-wrap gap-2 px-3">
                    {recent.map((r, i) => (
                      <button key={i} onClick={() => setQuery(r)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 transition">
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-white/30 px-3 py-2 flex items-center gap-2 uppercase tracking-widest">
                  <FiTrendingUp size={12} /> Trending
                </p>
                <div className="flex flex-wrap gap-2 px-3">
                  {TRENDING.map((t, i) => (
                    <button key={i} onClick={() => setQuery(t)}
                      className="px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg text-sm text-violet-400 transition">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LiveSearch;