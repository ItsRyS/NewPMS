
// src/pages/adminPage/AdminHome.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/SignIn'); // ถ้าไม่มี token ให้เปลี่ยนเส้นทางไปหน้า SignIn
        return;
      }

      const isValid = await verifyToken(token);
      if (!isValid) {
        localStorage.removeItem('token'); // ลบ token ถ้าไม่ถูกต้อง
        navigate('/SignIn'); // เปลี่ยนเส้นทางไปหน้า SignIn
      }
    };

    checkToken();
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to Admin Dashboard</h1>
      {/* เนื้อหาของ Admin Dashboard */}
    </div>
  );
};

export default AdminDashboard;
