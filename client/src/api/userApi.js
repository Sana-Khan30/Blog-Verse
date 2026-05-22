import API from './axiosInstance.js';

export const getProfile = (username) => API.get(`/users/${username}`);
export const updateProfile = (data) => API.put('/users/profile', data);
export const toggleBookmark = (blogId) => API.put(`/users/bookmark/${blogId}`);
export const getBookmarks = () => API.get('/users/bookmarks');