import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: 'https://newpms.onrender.com/api',
  withCredentials: true, // สำคัญมาก
  headers: {
    'Content-Type': 'application/json',
  }
});
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
// Request interceptor
api.interceptors.request.use(
  (config) => {
    const tabId = sessionStorage.getItem("tabId");
    if (tabId) {
      config.headers["x-tab-id"] = tabId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.get('/auth/refresh-session');
        if (response.data.success) {
          isRefreshing = false;
          processQueue(null);
          return api(originalRequest);
        } else {
          processQueue(new Error('Refresh failed'));
          window.location.href = '/signin';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
