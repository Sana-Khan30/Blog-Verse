import API from './axiosInstance.js';

export const getAllBlogs = (params) => API.get('/blogs', { params });
export const getBlogBySlug = (slug) => API.get(`/blogs/${slug}`);
export const createBlog = (data) => API.post('/blogs', data);
export const updateBlog = (id, data) => API.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => API.delete(`/blogs/${id}`);
export const toggleLike = (id) => API.put(`/blogs/${id}/like`);
export const getUserBlogs = (userId) => API.get(`/blogs/user/${userId}`);