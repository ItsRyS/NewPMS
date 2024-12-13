import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,

  Avatar,
  Button,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import LogoutIcon from "@mui/icons-material/Logout";
import api from "../services/api";

const drawerWidth = 240;

const SideAdmin = ({ mobileOpen, handleDrawerToggle, setTitle }) => {
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
      const tabId = sessionStorage.getItem("tabId");
      if (!tabId) return;

      const response = await api.post("/auth/logout", { tabId });
      if (response.data.success) {
        sessionStorage.removeItem("tabId");
        navigate("/SignIn");
      }
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const drawerContent = (
    <>
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
        <Divider sx={{ borderColor: "#ff0000", width: "100%", mt: 2 }} />
      </Box>

      <List>
        <NavLink
          to="/adminHome"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("หน้าหลัก")}>
            <ListItemIcon>
              <DashboardIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="หน้าหลัก" />
          </ListItemButton>
        </NavLink>

        <NavLink
          to="/adminHome/manage-user"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("จัดการผู้ใช้")}>
            <ListItemIcon>
              <PeopleIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="จัดการผู้ใช้" />
          </ListItemButton>
        </NavLink>

        <NavLink
          to="/adminHome/CheckProject"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("อนุมัติโครงการ")}>
            <ListItemIcon>
              <CheckCircleIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="อนุมัติโครงการ" />
          </ListItemButton>
        </NavLink>
        <NavLink
          to="/adminHome/upload-doc"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("แบบร่างเอกสาร")}>
            <ListItemIcon>
              <CloudUploadIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="แบบร่างเอกสาร" />
          </ListItemButton>
        </NavLink>

        <NavLink
          to="/adminHome/ViewProjectDocuments"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("ตรวจเอกสาร")}>
            <ListItemIcon>
              <CloudUploadIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="ตรวจเอกสาร" />
          </ListItemButton>
        </NavLink>

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
          ออกจากระบบ
        </Button>
      </Box>
    </>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#2d3a46",
            color: "#ffffff",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

SideAdmin.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default SideAdmin;
