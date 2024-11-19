import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import LoginTwoToneIcon from "@mui/icons-material/LoginTwoTone";
import AssignmentIndTwoToneIcon from "@mui/icons-material/AssignmentIndTwoTone";

const menuItems = [
  {
    text: "คณะอาจารย์",
    icon: <AssignmentIndTwoToneIcon />,
    to: "/TeacherPage",
    variant: "text", // default
  },
  {
    text: "เข้าสู่ระบบ",
    icon: <LoginTwoToneIcon />,
    to: "/SignIn",
    variant: "contained", // special case
    color: "warning",
    fontWeight: "bold",
  },
];

const NavbarHome = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#01153e",
        width: "100%",
        zIndex: 99,
        paddingX: 2,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            {" "}
            
            <img
              src="/it_logo2.svg"
              alt="IT-PMS Logo"
              style={{ height: "40px", width: "auto", marginRight: "8px" }}
            />
          </Link>
        </Box>

        {/* Menu Items */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {menuItems.map(
            ({ text, icon, to, variant, color, fontWeight }, index) => (
              <Button
                key={index}
                component={Link}
                to={to}
                startIcon={icon}
                variant={variant}
                color={color || "inherit"} // Default to "inherit" if not specified
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: fontWeight || "normal", // Default font weight
                }}
              >
                {text}
              </Button>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarHome;
