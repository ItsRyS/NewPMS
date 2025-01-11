import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout
  timeout: 10000
});

// Request interceptor with logging
api.interceptors.request.use(
  (config) => {
    // Add tab ID if available
    const tabId = sessionStorage.getItem('tabId');
    if (tabId) {
      config.headers['x-tab-id'] = tabId;
    }
    
    // Log request details in development
    if (import.meta.env.DEV) {
      console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`Response from ${response.config.url}:`, response.status);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Detailed error logging
    if (error.response) {
      // Server responded with error status
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        url: originalRequest.url
      });
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', {
        url: originalRequest.url,
        method: originalRequest.method
      });
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
    }

    // Handle 401 and attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.get('/auth/refresh-session');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;