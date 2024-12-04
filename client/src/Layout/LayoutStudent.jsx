// F:\NewPMS\client\src\Layout\LayoutStudent.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { Box, Toolbar } from "@mui/material";
import SideStudent from "../components/SideStudent";
import NavStudent from "../components/NavStudent";

const LayoutStudent = () => {
  const [title, setTitle] = useState("Dashboard");

  return (
    <Box sx={{ display: "flex" }}>
      <NavStudent handleDrawerToggle={() => {}} title={title} />
      <SideStudent
        mobileOpen={false}
        handleDrawerToggle={() => {}}
        setTitle={setTitle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
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

export default LayoutStudent;
