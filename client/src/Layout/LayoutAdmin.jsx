// F:\NewPMS\client\src\Layout\LayoutAdmin.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
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
      <SideAdmin open={isSidebarOpen} onClose={toggleSidebar} isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: isMobile ? 0 : "240px",
        }}
      >
        <NavAdmin onMenuClick={toggleSidebar} />
        <Toolbar />
        <Box sx={{ flexGrow: 1, overflow: "auto", padding: 3 }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutAdmin;
