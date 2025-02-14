import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // แก้ไขให้เรียกใช้ `api` แทน verifyToken

const AdminHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const tabId = sessionStorage.getItem("tabId");
        if (!sessionStorage.getItem("sessionActive")) {
          navigate("/signin"); // ✅ Redirect ถ้าไม่มี session
        }

        const response = await api.get("/auth/check-session", {
          headers: { "x-tab-id": tabId },
        });

        if (!response.data.isAuthenticated) {
          sessionStorage.removeItem("sessionActive"); // ✅ เคลียร์ session ถ้าหมดอายุ
          navigate("/signin");
        }
      } catch (error) {
        console.error("❌ Session check failed:", error);
        sessionStorage.removeItem("sessionActive");
        navigate("/signin");
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
