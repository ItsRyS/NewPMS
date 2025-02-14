import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
let refreshTokenPromise = null;
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


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // เช็คว่าเป็น 401 และยังไม่เคย retry
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh-session")
    ) {
      originalRequest._retry = true;

      try {
        // ถ้ายังไม่มีการ refresh token ที่กำลังทำงานอยู่
        if (!refreshTokenPromise) {
          refreshTokenPromise = api.get("/auth/refresh-session").finally(() => {
            refreshTokenPromise = null;
          });
        }

        // รอให้ refresh token เสร็จ
        const response = await refreshTokenPromise;

        if (response?.data?.success) {
          // ทำ request เดิมอีกครั้ง
          return api(originalRequest);
        } else {
          // ถ้า refresh ไม่สำเร็จ ให้ logout
          sessionStorage.clear();
          window.location.href = "/signin";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // กรณี refresh token error
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
