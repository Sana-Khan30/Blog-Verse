import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import API from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import { FiSave, FiUser, FiMail, FiFileText, FiArrowLeft } from 'react-icons/fi';

const Profile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put("/users/profile", form);
      // Context update karo naye data ke saath
      const token = localStorage.getItem("token");
      login(data.user, token);
      toast.success("Profile updated! ✨");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition mb-6"
      >
        <FiArrowLeft /> Back
      </button>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Profile ✨
      </h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
        {/* Avatar Preview */}
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              user?.username?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {user?.username}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {user?.email}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email{" "}
              <span className="text-gray-400 font-normal">(cannot change)</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avatar URL (optional)
            </label>
            <input
              type="url"
              name="avatar"
              value={form.avatar}
              onChange={handleChange}
              placeholder="https://example.com/your-photo.jpg"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio{" "}
              <span className="text-gray-400 font-normal">(max 200 chars)</span>
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                maxLength={200}
                placeholder="Tell the world about yourself..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
              />
            </div>
            <p className="text-right text-xs text-gray-400 mt-1">
              {form.bio.length}/200
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition"
          >
            <FiSave />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
