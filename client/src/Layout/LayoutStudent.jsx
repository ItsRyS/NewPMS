import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import SideStudent from "../components/SideStudent";
import NavStudent from "../components/NavStudent";

const LayoutStudent = () => {
  const [title, setTitle] = useState("Dashboard"); // ตั้งค่าชื่อ Dashboard เริ่มต้น

  return (
    <Box sx={{ display: "flex" }}>
      <NavStudent handleDrawerToggle={() => {}} title={title} />
      <SideStudent
        mobileOpen={false}
        handleDrawerToggle={() => {}}
        setTitle={setTitle}
      />
      {/* เพิ่มการเว้นที่สำหรับ Sidebar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: { sm: "240px" }, // เว้นที่สำหรับ Sidebar
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default LayoutStudent;
