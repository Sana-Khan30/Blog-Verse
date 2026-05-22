import { useState, useEffect, useCallback } from 'react';
import { toggleBookmark as apiToggleBookmark, getBookmarks as apiGetBookmarks } from '../api/userApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const STORAGE_KEY = 'blogverse_bookmarks';

export const useBookmark = () => {
  const { user } = useAuth();
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load bookmarks from server or localStorage
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) {
        // Load from localStorage for guest users
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
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setBookmarkIds(JSON.parse(stored));
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [user]);

  // Persist locally
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarkIds));
      } catch {}
    }
  }, [bookmarkIds, loading]);

  const toggleBookmark = useCallback(async (blogId) => {
    // Optimistic update
    const isCurrentlyBookmarked = bookmarkIds.includes(blogId);
    setBookmarkIds(prev =>
      isCurrentlyBookmarked
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId]
    );

    if (!user) return; // Guest users only get local state

    try {
      const { data } = await apiToggleBookmark(blogId);
      // Sync with server response
      const ids = data.isBookmarked
        ? [...bookmarkIds, blogId]
        : bookmarkIds.filter(id => id !== blogId);
      setBookmarkIds(ids);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Revert on failure
      setBookmarkIds(prev =>
        isCurrentlyBookmarked
          ? [...prev, blogId]
          : prev.filter(id => id !== blogId)
      );
    }
  }, [bookmarkIds, user]);

  const isBookmarked = useCallback((blogId) => {
    return bookmarkIds.includes(blogId);
  }, [bookmarkIds]);

  const clearAllBookmarks = useCallback(() => {
    setBookmarkIds([]);
  }, []);

  return {
    bookmarkIds,
    loading,
    toggleBookmark,
    isBookmarked,
    clearAllBookmarks,
    bookmarkCount: bookmarkIds.length,
  };
};

export default useBookmark;