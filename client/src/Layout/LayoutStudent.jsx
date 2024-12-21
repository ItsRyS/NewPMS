import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import SideStudent from "../components/SideStudent";
import NavStudent from "../components/NavStudent";
import { Box, Toolbar } from "@mui/material";

const LayoutStudent = () => {
  const [mobileOpen, setMobileOpen] = useState(false); // เพิ่ม State สำหรับ Drawer
  const [title, setTitle] = useState("Dashboard");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen); // สลับสถานะ Drawer
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <NavStudent handleDrawerToggle={handleDrawerToggle} title={title} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <SideStudent
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          setTitle={setTitle}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            marginLeft: { sm: "240px" },
            padding: 2, 
            overflowY: "auto", 
          }}
        >
          <Toolbar />
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutStudent;
