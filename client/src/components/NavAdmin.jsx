import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../services/api";

export default function NavAdmin({ onMenuClick }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState("Loading...");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await api.get("/auth/check-session"); // API เรียกเพื่อดึงข้อมูล session
        if (response.data.isAuthenticated) {
          setUsername(response.data.user.username);
        } else {
          navigate("/SignIn"); // Redirect หาก session ไม่ถูกต้อง
        }
      } catch (error) {
        console.error("Failed to fetch session info:", error);
        navigate("/SignIn"); // Redirect ในกรณีเกิดข้อผิดพลาด
      }
    };

    fetchUsername();
  }, [navigate]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // เรียก API สำหรับ logout
      handleMenuClose();
      navigate("/SignIn");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        color: "#333",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: isMobile ? "100%" : "calc(100% - 240px)",
        ml: isMobile ? 0 : "240px",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ color: "#333", fontWeight: "bold" }}>
          <Box>
            <img
              src="/it_logo2.svg"
              alt="IT-PMS Logo"
              style={{ height: "60px", width: "auto", marginRight: "8px" }}
            />
          </Box>
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box
            onClick={handleMenuOpen}
            sx={{
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
              p: 1,
            }}
          >
            <IconButton>
              <Avatar alt={username} src="https://i.pravatar.cc/300" />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#333" }}>
              {username}
            </Typography>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              "& .MuiMenu-paper": {
                mt: 0,
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

NavAdmin.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};
