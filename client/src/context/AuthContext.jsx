import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/authApi.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await getMe();
          setUser(data.user);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user bookmarks list in context
  const updateUserBookmarks = (bookmarks) => {
    if (user) {
      setUser(prev => ({ ...prev, bookmarks }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserBookmarks }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);