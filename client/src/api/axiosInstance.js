import axios from 'axios';

// Ek baar base URL set karo — har jagah repeat nahi karna
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:5000/api
});

// REQUEST INTERCEPTOR
// Har request se pehle automatically JWT token attach karo
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
// Token expire ho jaye toh automatically logout karo
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;