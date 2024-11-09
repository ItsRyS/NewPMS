import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NavAdmin() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleMenuClose();
    navigate("/SignIn");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        color: "#333",
        zIndex: 1201,
        width: "calc(100% - 240px)", // ปรับขนาดความกว้างให้เท่ากับพื้นที่ที่เหลือ
        ml: "240px", // เลื่อน NavAdmin ไปทางขวาให้ตรงกับตำแหน่งของ SideAdmin
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ color: "#333", fontWeight: "bold" }}>
          Dashboard
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notifications Icon */}
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Avatar */}
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar alt="User Profile" src="https://i.pravatar.cc/300" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 150,
                backgroundColor: "#ffffff",
                color: "#333",
                "& .MuiMenuItem-root": {
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                },
              },
            }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
