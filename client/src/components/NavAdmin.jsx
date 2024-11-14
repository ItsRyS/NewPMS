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

export default function NavAdmin({ onMenuClick }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const storedUsername = localStorage.getItem("username"); // ดึงชื่อผู้ใช้จาก localStorage
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      console.log("ไม่พบชื่อผู้ใช้ใน localStorage");
    }
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username"); // ลบชื่อผู้ใช้เมื่อออกจากระบบ
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
          Dashboard
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box onClick={handleMenuOpen} 
            sx={{
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
              p : 1
            }}
          >
            <IconButton >
              <Avatar alt={username} src="https://i.pravatar.cc/300" />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#333" }}>
              {username || "User not found"}
            </Typography>
          </Box>

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
            <MenuItem disabled>
              <Typography variant="body2">
                {username || "User not found"}
              </Typography>
            </MenuItem>
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
