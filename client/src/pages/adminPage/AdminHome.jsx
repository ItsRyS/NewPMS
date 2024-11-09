// src/pages/adminPage/AdminHome.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../services/api";

const AdminHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/SignIn"); // Redirect if no token
        return;
      }
  
      const isValid = await verifyToken(token);
      if (!isValid) {
        localStorage.removeItem("token"); // Remove invalid token
        navigate("/SignIn"); // Redirect to SignIn
      }
    };
  
    checkToken();
  }, [navigate]);

  return (
    <div>
      {
        <>
          
        </>
      }
    </div>
  );
};

export default AdminHome;
