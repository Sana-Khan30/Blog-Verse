import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance.js';
import { updateBlog } from '../api/blogApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const CATEGORIES = ['Technology','Programming','Design','Business','Lifestyle','Health','Travel','Food','Other'];

const EditBlog = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', content: '', category: '', tags: '', excerpt: '', coverImage: ''
  });
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // ID se blog fetch karo
        const { data } = await API.get(`/blogs`);
        const blog = data.blogs.find((b) => b._id === id);
        if (!blog) {
          toast.error('Blog not found');
          return navigate('/dashboard');
        }
        // Sirf author edit kar sakta hai
        if (blog.author._id !== user._id && user.role !== 'admin') {
          toast.error('Not authorized');
          return navigate('/dashboard');
        }
        setForm({
          title:       blog.title,
          content:     blog.content,
          category:    blog.category,
          tags:        blog.tags?.join(', ') || '',
          excerpt:     blog.excerpt || '',
          coverImage:  blog.coverImage || '',
        });
      } catch {
        toast.error('Failed to load blog');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateBlog(id, form);
      toast.success('Blog updated! ✅');
      navigate(`/blog/${data.blog.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)}
  className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition mb-6">
  <FiArrowLeft /> Back
</button>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Blog ✏️
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input type="text" name="title" value={form.title}
            onChange={handleChange} required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-lg font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL</label>
          <input type="url" name="coverImage" value={form.coverImage}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
          {form.coverImage && (
            <img src={form.coverImage} alt="Preview"
              className="mt-2 h-40 w-full object-cover rounded-xl"
              onError={(e) => e.target.style.display='none'} />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
            <input type="text" name="tags" value={form.tags}
              onChange={handleChange} placeholder="react, nodejs"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
          <textarea name="excerpt" value={form.excerpt}
            onChange={handleChange} rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
          <textarea name="content" value={form.content}
            onChange={handleChange} required rows={14}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none font-mono text-sm"
          />
        </div>

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition text-lg">
          <FiSave />
          {saving ? 'Saving...' : 'Update Blog'}
        </button>
      </form>
    </div>
  );
};

export default EditBlog;