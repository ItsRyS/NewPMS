// F:\NewPMS\client\src\Layout\LayoutAdmin.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import SideAdmin from "../components/SideAdmin";
import NavAdmin from "../components/NavAdmin";
import { Box, Toolbar } from "@mui/material";

const LayoutAdmin = () => {
  const [title, setTitle] = useState("Dashboard");

  return (
    <Box sx={{ display: "flex" }}>
      <NavAdmin handleDrawerToggle={() => {}} title={title} />
      <SideAdmin
        mobileOpen={false}
        handleDrawerToggle={() => {}}
        setTitle={setTitle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: { sm: "240px" },
        }}
      >
        <Toolbar />
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
};

export default LayoutAdmin;
