import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  Avatar,
  Toolbar,
  Button,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../services/api";

export default function SideAdmin({ open, onClose, isMobile }) {
  const [openProjectManagement, setOpenProjectManagement] = useState(false);
  const [username, setUsername] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await api.get("/auth/check-session");
        if (response.data.isAuthenticated) {
          setUsername(response.data.user.username);
        }
      } catch (error) {
        console.error("Failed to fetch session info:", error);
      }
    };
    fetchUsername();
  }, []);

  const handleLogout = async () => {
    try {
      const tabId = sessionStorage.getItem("tabId"); // ดึง tabId จาก sessionStorage
      const response = await api.post("/auth/logout", { tabId }); // ส่ง tabId ไปกับ request
  
      if (response.data.success) {
        console.log("Logout successful:", response.data.message);
        sessionStorage.removeItem("tabId"); // ลบ tabId ในฝั่ง client
        navigate("/SignIn");
      } else {
        console.error("Logout failed:", response.data.error);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  
  

  const toggleProjectManagement = () => {
    setOpenProjectManagement(!openProjectManagement);
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#2d3a46",
          color: "#ffffff",
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Toolbar />
      <Box
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar alt={username} src="https://i.pravatar.cc/300" />
        <Typography variant="body1" sx={{ color: "#ffffff", marginTop: 1 }}>
          {username}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "#374151" }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/adminHome">
            <ListItemIcon>
              <DashboardIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <Typography variant="body2" sx={{ padding: 2, color: "#9CA3AF" }}>
          User Management
        </Typography>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/adminHome/manage-user">
            <ListItemIcon>
              <PeopleIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="จัดการผู้ใช้" />
          </ListItemButton>
        </ListItem>
        <Typography variant="body2" sx={{ padding: 2, color: "#9CA3AF" }}>
          Project Management
        </Typography>
        <ListItemButton onClick={toggleProjectManagement}>
          <ListItemIcon>
            <AssignmentIcon sx={{ color: "#9CA3AF" }} />
          </ListItemIcon>
          <ListItemText primary="จัดการโครงงาน" />
          {openProjectManagement ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openProjectManagement} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={Link}
              to="/adminHome/CheckProject"
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <CheckCircleIcon sx={{ color: "#9CA3AF" }} />
              </ListItemIcon>
              <ListItemText primary="ตรวจสอบคำร้อง" />
            </ListItemButton>
          </List>
        </Collapse>
        <Typography variant="body2" sx={{ padding: 2, color: "#9CA3AF" }}>
          Document Management
        </Typography>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/adminHome/upload-doc">
            <ListItemIcon>
              <CloudUploadIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="เพิ่มแบบร่างเอกสาร" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider sx={{ borderColor: "#374151", mt: 2 }} />
      <Box sx={{ padding: 2 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}

SideAdmin.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};
