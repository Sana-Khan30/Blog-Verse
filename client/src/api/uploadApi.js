import API from './axiosInstance.js';

export const uploadImage = async (file) => {
  // FormData use karo — file binary data hai
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.url; // Cloudinary URL
};