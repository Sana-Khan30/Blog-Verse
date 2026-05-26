import { useState, useEffect, useCallback } from 'react';
import { toggleBookmark as apiToggleBookmark, getBookmarks as apiGetBookmarks } from '../api/userApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const STORAGE_KEY = 'blogverse_bookmarks';

export const useBookmark = () => {
  const { user } = useAuth();
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setBookmarkIds(JSON.parse(stored));
        } catch {}
        setLoading(false);
        return;
      }
      try {
        const { data } = await apiGetBookmarks();
        const ids = data.blogs.map(b => b._id);
        setBookmarkIds(ids);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      } catch {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setBookmarkIds(JSON.parse(stored));
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const toggleBookmark = useCallback(async (blogId) => {
    const isCurrentlyBookmarked = bookmarkIds.includes(blogId);
    setBookmarkIds(prev =>
      isCurrentlyBookmarked ? prev.filter(id => id !== blogId) : [...prev, blogId]
    );
    if (!user) return;
    try {
      await apiToggleBookmark(blogId);
    } catch {
      setBookmarkIds(prev =>
        isCurrentlyBookmarked ? [...prev, blogId] : prev.filter(id => id !== blogId)
      );
    }
  }, [bookmarkIds, user]);

  const isBookmarked = useCallback((blogId) => {
    return bookmarkIds.includes(blogId);
  }, [bookmarkIds]);

  return { bookmarkIds, loading, toggleBookmark, isBookmarked, bookmarkCount: bookmarkIds.length };
};

export default useBookmark;