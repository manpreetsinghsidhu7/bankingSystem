import axios from 'axios';

// 1. Get Base URL from environment or default to local
const rawBaseURL = import.meta.env.VITE_API_URL;

// 2. Robustly ensure it ends with /api/v1/
const getSanitizedBaseURL = (url) => {
  let cleanUrl = url.trim();
  
  // If user forgot /api/v1, add it
  if (!cleanUrl.includes('/api/v1')) {
     // Remove trailing slash if present before appending
     cleanUrl = cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
     cleanUrl = `${cleanUrl}/api/v1`;
  }
  
  // Ensure it ends with exactly one trailing slash
  return cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;
};

const api = axios.create({
  baseURL: getSanitizedBaseURL(rawBaseURL),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Axios response.data is the body of the response
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    const errorMessage = error.response?.data?.message || error.message || 'Connection error';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
