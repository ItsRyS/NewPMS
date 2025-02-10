import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// สร้าง instance ของ Axios
//const api = axios.create({
  //baseURL: 'http://localhost:5000/api', // ตั้งค่าฐาน URL สำหรับ API
  //baseURL: 'https://newpms.onrender.com/api', // ตั้งค่าฐาน URL สำหรับ API
  //withCredentials: true, // เปิดใช้งาน cookie สำหรับการร้องขอ
//});
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // ใช้ค่าที่กำหนดจาก .env
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
      originalRequest.url !== '/auth/login' // เพิ่มเงื่อนไขไม่ให้ refresh session ระหว่าง login
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
// Interceptor for response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.data.message || 'Something went wrong'}`);
    } else {
      console.error('Network Error: Please check your connection.');
    }
    return Promise.reject(error); // ให้แต่ละหน้าใช้ .catch() จัดการ error เอง
  }
);
export default api;
export { API_BASE_URL };