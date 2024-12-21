import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import SideAdmin from "../components/SideAdmin";
import NavAdmin from "../components/NavAdmin";
import { Box, Toolbar } from "@mui/material";

const LayoutAdmin = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [title, setTitle] = useState("Dashboard");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* AppBar */}
      <NavAdmin handleDrawerToggle={handleDrawerToggle} title={title} />
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Drawer */}
        <SideAdmin
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          setTitle={setTitle}
        />
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            marginLeft: { sm: "240px" }, // กำหนดระยะขอบสำหรับ Drawer
    padding: 2, // เพิ่ม padding เพื่อให้มีพื้นที่
            overflowY: "auto", // เพิ่ม scroll ถ้าเนื้อหายาวเกิน
          }}
        >
          <Toolbar /> {/* ช่วยดัน Content ลงตาม AppBar */}
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutAdmin;
