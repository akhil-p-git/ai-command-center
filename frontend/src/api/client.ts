import axios from 'axios';

// Base URL configuration - typically from env vars
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors like 401 Unauthorized here
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

