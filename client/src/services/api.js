import axios from 'axios';

// สร้าง instance ของ Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api', // ใช้ import.meta.env สำหรับ Vite
  withCredentials: true, // เปิดใช้งาน cookie สำหรับการร้องขอ
});

// Interceptor สำหรับใส่ Tab ID ลงใน Headers ของทุกคำขอ
api.interceptors.request.use(
  (config) => {
    const tabId = sessionStorage.getItem('tabId'); // ดึง tabId จาก sessionStorage
    if (tabId) {
      config.headers['x-tab-id'] = tabId; // เพิ่ม tabId ลงใน Headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // ส่งคืนข้อผิดพลาดถ้าพบปัญหา
  }
);

// Interceptor สำหรับจัดการคำตอบ และลอง Refresh Session เมื่อพบ 401 Unauthorized
api.interceptors.response.use(
  (response) => response, // ส่งคืนคำตอบที่สำเร็จ
  async (error) => {
    const originalRequest = error.config;

    // ตรวจสอบสถานะ 401 Unauthorized และยังไม่ได้ลองคำขอนี้ใหม่
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login'
    ) {
      originalRequest._retry = true; // ป้องกันการวนลูปคำขอ

      try {
        await api.get('/auth/refresh-session'); // เรียก API เพื่อ Refresh Session
        return api(originalRequest); // ส่งคำขอเดิมอีกครั้ง
      } catch (refreshError) {
        return Promise.reject(refreshError); // ส่งคืนข้อผิดพลาดถ้า Refresh ล้มเหลว
      }
    }

    return Promise.reject(error); // ส่งคืนข้อผิดพลาดเดิมถ้าไม่ใช่กรณี 401
  }
);

export default api;
