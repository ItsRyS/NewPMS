import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // เปลี่ยนเป็น URL ของ backend ของคุณ
});
const API_URL = 'http://localhost:5000/api';

// ฟังก์ชันตรวจสอบ token
export const verifyToken = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verifyToken`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.isValid; // backend ควรตอบกลับสถานะ isValid
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};
export default api;
