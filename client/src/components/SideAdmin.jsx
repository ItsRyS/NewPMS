import { useState } from "react";
import PropTypes from "prop-types";
import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Collapse } from "@mui/material";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

export default function SideAdmin({ open, onClose, isMobile }) {
  const [openProjectManagement, setOpenProjectManagement] = useState(false);

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
      <Box sx={{ padding: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
          IT-PMS
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
            <ListItemText primary="Manage Users" />
          </ListItemButton>
        </ListItem>

        <Typography variant="body2" sx={{ padding: 2, color: "#9CA3AF" }}>
          Project Management
        </Typography>
        <ListItemButton onClick={toggleProjectManagement}>
          <ListItemIcon>
            <AssignmentIcon sx={{ color: "#9CA3AF" }} />
          </ListItemIcon>
          <ListItemText primary="Projects" />
          {openProjectManagement ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openProjectManagement} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} to="/adminHome/CheckProject" sx={{ pl: 4 }}>
              <ListItemIcon>
                <CheckCircleIcon sx={{ color: "#9CA3AF" }} />
              </ListItemIcon>
              <ListItemText primary="Check Project" />
            </ListItemButton>
            <ListItemButton component={Link} to="/adminHome/release-project" sx={{ pl: 4 }}>
              <ListItemIcon>
                <CheckCircleIcon sx={{ color: "#9CA3AF" }} />
              </ListItemIcon>
              <ListItemText primary="Release Project" />
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
            <ListItemText primary="Upload Document" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

SideAdmin.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};
