import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// สร้าง instance ของ Axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // ใช้ค่าที่กำหนดจาก .env
  withCredentials: true, // เปิดใช้งาน cookie สำหรับการร้องขอ
});

api.interceptors.request.use(
  (config) => {
    const tabId = sessionStorage.getItem("tabId");
    if (tabId) {
      config.headers["x-tab-id"] = tabId; // ✅ เพิ่ม tabId ใน Headers
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ✅ แก้ไข Interceptor เพื่อป้องกัน Loop
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login" &&
      originalRequest.url !== "/auth/refresh-session"
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.get("/auth/refresh-session");

        if (refreshResponse.data.success) {
          return api(originalRequest); // ✅ ใช้ session ที่รีเฟรชแล้ว
        } else {
          console.warn("Session expired. Redirecting to login...");
          sessionStorage.clear(); // ✅ เคลียร์ sessionStorage
          window.location.href = "/signin";
          return Promise.reject(error);
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
