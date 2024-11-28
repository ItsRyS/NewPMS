import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Import API configuration

function StudentHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get("/auth/check-session"); // ตรวจสอบ session
        if (!response.data.isAuthenticated) {
          navigate("/SignIn"); // ถ้า session หมดอายุหรือไม่ถูกต้องให้ redirect
        }
      } catch (error) {
        console.error("Session check failed:", error);
        navigate("/SignIn"); // Redirect กรณีเกิดข้อผิดพลาด
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div>
      <h1>Student Home</h1>
      {/* เนื้อหาสำหรับ Student */}
    </div>
  );
}

export default StudentHome;
