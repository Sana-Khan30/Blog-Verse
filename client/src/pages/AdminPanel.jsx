import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../api/axiosInstance.js';
import { deleteBlog } from '../api/blogApi.js';
import toast from 'react-hot-toast';
import {
  FiUsers, FiFileText, FiTrash2,
  FiArrowLeft, FiEye, FiShield
} from 'react-icons/fi';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers]   = useState([]);
  const [blogs, setBlogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Sirf admin access kar sakta hai
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access only!');
      return navigate('/');
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, blogsRes] = await Promise.all([
        API.get('/users'),
        API.get('/blogs?limit=50'),
      ]);
      setUsers(usersRes.data.users);
      setBlogs(blogsRes.data.blogs);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their blogs?')) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await deleteBlog(id);
      setBlogs(blogs.filter((b) => b._id !== id));
      toast.success('Blog deleted!');
    } catch {
      toast.error('Failed to delete blog');
    }
  };

  // Stats
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <FiShield className="text-primary-600" size={24} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all users and blogs
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users.length,  icon: '👥' },
          { label: 'Total Blogs', value: blogs.length,  icon: '📝' },
          { label: 'Total Views', value: totalViews,    icon: '👁️' },
          { label: 'Total Likes', value: totalLikes,    icon: '❤️' },
        ].map((s) => (
          <div key={s.label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center shadow-sm">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['users', 'blogs'].map((tab) => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition capitalize
              ${activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-400'
              }`}>
            {tab === 'users' ? <FiUsers size={16} /> : <FiFileText size={16} />}
            {tab} ({tab === 'users' ? users.length : blogs.length})
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-gray-900 dark:text-white">All Users</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((u) => (
              <div key={u._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {u.avatar
                    ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : u.username?.[0]?.toUpperCase()
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {u.username}
                    </span>
                    {u.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {u.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Joined: {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Delete — apna account nahi delete kar sakta */}
                {u._id !== user._id && (
                  <button onClick={() => handleDeleteUser(u._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                    <FiTrash2 size={16} />
                  </button>
                )}
                {u._id === user._id && (
                  <span className="text-xs text-gray-400 px-2">You</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BLOGS TAB ── */}
      {activeTab === 'blogs' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-gray-900 dark:text-white">All Blogs</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {blogs.map((blog) => (
              <div key={blog._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">

                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0">
                  {blog.coverImage
                    ? <img src={blog.coverImage} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">📝</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                    {blog.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>by {blog.author?.username}</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye size={11} /> {blog.views || 0}
                    </span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Delete */}
                <button onClick={() => handleDeleteBlog(blog._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;