import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideAdmin from "../components/SideAdmin";
import NavAdmin from "../components/NavAdmin";
import { useTheme, useMediaQuery } from "@mui/material";

const LayoutAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <SideAdmin open={isSidebarOpen} onClose={toggleSidebar} isMobile={isMobile} />

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : "240px", display: "flex", flexDirection: "column" }}>
        <NavAdmin onMenuClick={toggleSidebar} />
        <div style={{ flex: 1, paddingTop: "64px", overflow: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayoutAdmin;
