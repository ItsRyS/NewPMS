import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login"
    ) {
      originalRequest._retry = true;

      try {
        const tabId = sessionStorage.getItem("tabId");
        const refreshResponse = await api.get("/auth/refresh-session", {
          headers: { "x-tab-id": tabId }
        });

        if (refreshResponse.data.success) {
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Session refresh failed:", refreshError);
        sessionStorage.clear();
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
