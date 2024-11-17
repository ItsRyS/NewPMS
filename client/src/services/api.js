import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ตั้งค่า baseURL ให้ตรงกับ backend
  withCredentials: true, // ถ้าต้องใช้ cookies ในการรับ-ส่งข้อมูล
});

// ฟังก์ชันสำหรับตรวจสอบ Token (สามารถเพิ่มหรือปรับแต่งได้ตามต้องการ)
export const verifyToken = async (token) => {
  try {
    const response = await axios.post(`${api.defaults.baseURL}/auth/verifyToken`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.isValid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// ใช้ interceptor เพื่อแนบ Token ทุกครั้งใน request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // หรือเปลี่ยนเป็น method การดึง token ของคุณ
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
