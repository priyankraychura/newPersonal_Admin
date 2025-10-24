// src/services/AdminAPI.js

import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/user/userSlice';

const AdminAPI = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL,
  withCredentials: true
});

AdminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = token;
    } else {
      console.log('No token found, logging out.');
      store.dispatch(logout());
      
      // Navigate to login page. This causes a full page refresh.
      window.location.href = '/'; 

      // Reject the promise to prevent the original request from being sent
      return Promise.reject(new Error('No token found. Redirecting to login.'));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default AdminAPI;