import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideAdmin from "../components/SideAdmin";
import NavAdmin from "../components/NavAdmin";
import { useTheme, useMediaQuery, Box, Toolbar } from "@mui/material";

const LayoutAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <SideAdmin open={isSidebarOpen} onClose={toggleSidebar} isMobile={isMobile} />

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column",
          marginLeft: isMobile ? 0 : "240px" // เลื่อนเนื้อหาเมื่ออยู่ในโหมด Desktop
        }}
      >
        {/* NavBar */}
        <NavAdmin onMenuClick={toggleSidebar} />
        
        {/* Toolbar สำหรับระยะห่าง */}
        <Toolbar />
        
        {/* Content ที่จะเปลี่ยนตาม Route */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: "auto", 
            padding: 3 // padding ของเนื้อหาหลัก
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutAdmin;
