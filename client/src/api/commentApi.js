import API from './axiosInstance.js';

export const getComments = (blogId) => API.get(`/comments/${blogId}`);
export const addComment = (blogId, data) => API.post(`/comments/${blogId}`, data);
export const deleteComment = (commentId) => API.delete(`/comments/${commentId}`);