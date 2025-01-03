import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // แก้ไขให้เรียกใช้ `api` แทน verifyToken

const AdminHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const tabId = sessionStorage.getItem('tabId'); // ดึง tabId จาก sessionStorage
        const response = await api.get('/auth/check-session', {
          headers: { 'x-tab-id': tabId }, // ส่ง tabId ใน Header
        });

        if (!response.data.isAuthenticated) {
          navigate('/SignIn'); // Redirect ถ้า session หมดอายุหรือไม่ถูกต้อง
        }
      } catch (error) {
        console.error('Session check failed:', error);
        navigate('/SignIn'); // Redirect ในกรณีที่ API ล้มเหลว
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to Admin Home</h1>
      {/* ส่วนอื่น ๆ ของหน้า */}
    </div>
  );
};

export default AdminHome;
