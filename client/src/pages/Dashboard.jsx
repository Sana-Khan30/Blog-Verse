import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getUserBlogs, deleteBlog } from "../api/blogApi.js";
import { getBookmarks as fetchBookmarks } from "../api/userApi.js";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiEdit, FiTrash2, FiEye, FiHeart,
  FiPlus, FiUser, FiArrowLeft, FiBookmark,
  FiExternalLink, FiClock, FiMessageCircle
} from "react-icons/fi";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'blogs');
  const [blogs, setBlogs] = useState([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'bookmarks') setTab('bookmarks');
  }, [searchParams]);

  const fetchMyBlogs = async () => {
    try {
      const { data } = await getUserBlogs(user._id);
      setBlogs(data.blogs);
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookmarks = async () => {
    try {
      const { data } = await fetchBookmarks();
      setBookmarkedBlogs(data.blogs || []);
    } catch {
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (tab === 'blogs') {
      fetchMyBlogs();
    } else {
      fetchMyBookmarks();
    }
  }, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await deleteBlog(id);
      setBlogs(blogs.filter((b) => b._id !== id));
      toast.success("Blog deleted!");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0);

  const tabs = [
    { key: 'blogs', label: 'My Blogs', icon: FiEdit, count: blogs.length },
    { key: 'bookmarks', label: 'Bookmarks', icon: FiBookmark, count: bookmarkedBlogs.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
                        onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition p-2 rounded-xl hover:bg-white/5"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-3xl font-black text-white">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome back,{" "}
              <span className="text-violet-400 font-semibold">{user?.username}</span>
            </p>
          </div>
        </div>
        <Link
          to="/create-blog"
          className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500
            text-white text-sm font-semibold transition shadow-lg shadow-violet-500/20"
        >
          <FiPlus size={15} /> New Blog
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Blogs", value: blogs.length, icon: "📝" },
          { label: "Total Views", value: totalViews, icon: "👁️" },
          { label: "Total Likes", value: totalLikes, icon: "❤️" },
          { label: "Saved Posts", value: bookmarkedBlogs.length, icon: "🔖" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-dark rounded-2xl p-5 text-center border border-white/[0.06]"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Profile Quick View */}
      <div className="glass-dark rounded-2xl p-6 mb-8 flex items-center gap-5 border border-white/[0.06]">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            user?.username?.[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white">{user?.username}</h3>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <p className="text-gray-500 text-xs mt-1">{user?.bio || "No bio yet"}</p>
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition whitespace-nowrap"
        >
          <FiUser size={14} /> Edit Profile
        </Link>
      </div>

      {/* ���─ Tabs ── */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <motion.button
              key={t.key}
              onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === t.key
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <Icon size={14} />
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20' : 'bg-white/5'
              }`}>
                {t.key === 'blogs' ? blogs.length : bookmarkedBlogs.length}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          Loading...
        </div>
      ) : tab === 'bookmarks' ? (
        /* Bookmarks tab */
        bookmarkedBlogs.length === 0 ? (
          <div className="text-center py-20 glass-dark rounded-3xl border border-white/[0.06]">
            <span className="text-7xl mb-6 block">🔖</span>
            <h3 className="text-2xl font-bold text-white mb-2">No saved blogs</h3>
            <p className="text-gray-400 mb-6">Bookmark blogs to read them later!</p>
            <Link to="/" className="px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 transition">
              Browse Blogs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarkedBlogs.map((blog, i) => (
              <BlogGridCard key={blog._id} blog={blog} index={i} />
            ))}
          </div>
        )
      ) : (
        /* My Blogs tab */
        <div className="glass-dark rounded-2xl border border-white/[0.06] overflow-hidden">
          {blogs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-5xl mb-4">✍️</p>
              <p className="text-gray-400 mb-4">No blogs yet!</p>
              <Link to="/create-blog" className="px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition">
                Write Your First Blog
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {blogs.map((blog) => (
                <div key={blog._id} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-violet-900/50 to-gray-900 flex-shrink-0">
                    {blog.coverImage ? (
                      <img src={blog.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">✦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/blog/${blog.slug}`} className="font-semibold text-white hover:text-violet-300 transition line-clamp-1">
                      {blog.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8">{blog.category}</span>
                      <span className="flex items-center gap-1"><FiEye size={11}/> {blog.views || 0}</span>
                      <span className="flex items-center gap-1"><FiHeart size={11}/> {blog.likes?.length || 0}</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/edit-blog/${blog._id}`} className="p-2 rounded-lg text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition">
                      <FiEdit size={15}/>
                    </Link>
                    <button onClick={() => handleDelete(blog._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition">
                      <FiTrash2 size={15}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Small card for bookmark grid view ──────────────────────────────────────
const BlogGridCard = ({ blog, index }) => {
  const rt = Math.max(1, Math.ceil((blog.content || '').replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).length / 200));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link to={`/blog/${blog.slug}`} className="group block">
        <div className="glass-dark rounded-2xl overflow-hidden border border-white/[0.06] hover:border-violet-500/20 transition-all duration-300 hover:-translate-y-1">
          {blog.coverImage && (
            <div className="h-36 overflow-hidden">
              <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/15 text-violet-300 border border-violet-500/20">{blog.category}</span>
              <span className="flex items-center gap-1 text-xs text-gray-500"><FiClock size={10}/>{rt}m</span>
            </div>
            <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-violet-300 transition-colors">{blog.title}</h3>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><FiHeart size={10}/>{blog.likes?.length || 0}</span>
              <span className="flex items-center gap-1"><FiEye size={10}/>{blog.views || 0}</span>
              <FiExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-violet-400"/>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Dashboard;
