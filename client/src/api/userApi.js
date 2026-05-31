import API from './axiosInstance.js';

export const getBookmarks    = ()       => API.get('/users/bookmarks');
export const toggleBookmark  = (blogId) => API.put(`/users/bookmark/${blogId}`);
export const getUserProfile  = (username) => API.get(`/users/${username}`);
export const updateProfile   = (data)   => API.put('/users/profile', data);
