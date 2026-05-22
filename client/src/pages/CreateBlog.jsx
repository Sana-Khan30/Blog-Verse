import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog } from '../api/blogApi.js';
import { uploadImage } from '../api/uploadApi.js';
import toast from 'react-hot-toast';
import { FiSave, FiX, FiUpload, FiArrowLeft } from 'react-icons/fi';

const CATEGORIES = [
  'Technology','Programming','Design',
  'Business','Lifestyle','Health','Travel','Food','Other'
];

const CreateBlog = () => {
  const [form, setForm] = useState({
    title: '', content: '', category: 'Technology',
    tags: '', excerpt: '', coverImage: '',
  });
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Image file select karna
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Size check — 5MB max
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be under 5MB');
    }

    setImageFile(file);
    // Local preview banana — Cloudinary pe upload baad mein hoga
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.content.length < 50) {
      return toast.error('Content must be at least 50 characters');
    }

    setLoading(true);
    try {
      let coverImageUrl = form.coverImage;

      // Pehle image upload karo agar file select kiya hai
      if (imageFile) {
        setUploading(true);
        toast.loading('Uploading image...', { id: 'upload' });
        coverImageUrl = await uploadImage(imageFile);
        toast.success('Image uploaded!', { id: 'upload' });
        setUploading(false);
      }

      // Blog create karo
      const { data } = await createBlog({
        ...form,
        coverImage: coverImageUrl,
      });

      toast.success('Blog published! 🎉');
      navigate(`/blog/${data.blog.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create blog');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Write a Blog ✍️
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input type="text" name="title" value={form.title}
            onChange={handleChange} required
            placeholder="Enter an engaging title..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-lg font-medium"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cover Image
          </label>

          {/* Upload Box */}
          <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-500 transition bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview"
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <p className="text-white font-medium">Change Image</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <FiUpload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Click to upload cover image
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  JPG, PNG, WebP — Max 5MB
                </p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange}
              className="hidden" />
          </label>

          {/* OR URL input */}
          <div className="mt-2">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-2">
              — or paste image URL —
            </p>
            <input type="url" name="coverImage" value={form.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
            />
          </div>
        </div>

        {/* Category + Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select name="category" value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input type="text" name="tags" value={form.tags}
              onChange={handleChange}
              placeholder="react, nodejs, webdev"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Short Description
          </label>
          <textarea name="excerpt" value={form.excerpt}
            onChange={handleChange} rows={2}
            placeholder="Brief summary of your blog..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content * <span className="text-gray-400 font-normal">(min 50 chars)</span>
          </label>
          <textarea name="content" value={form.content}
            onChange={handleChange} required rows={14}
            placeholder="Write your blog content here..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none font-mono text-sm"
          />
          <p className="text-right text-xs text-gray-400 mt-1">
            {form.content.length} characters
          </p>
        </div>

        {/* Submit */}
        <button type="submit"
          disabled={loading || uploading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition text-lg">
          <FiSave />
          {uploading ? 'Uploading Image...' : loading ? 'Publishing...' : 'Publish Blog'}
        </button>
      </form>
    </div>
  );
};

export default CreateBlog;