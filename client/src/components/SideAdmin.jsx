import React from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Collapse } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import InboxIcon from "@mui/icons-material/Inbox";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WorkIcon from "@mui/icons-material/Work";

export default function SideAdmin() {
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#111827", // Background สีเข้ม
          color: "#ffffff", // สีของข้อความ
        },
      }}
    >
      <Box sx={{ padding: 2 }}>
        {/* Logo and Workspace */}
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
          DeviasKit
        </Typography>
        <Box
          sx={{
            backgroundColor: "#1F2937",
            padding: 1,
            borderRadius: 1,
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <InboxIcon />
          <Typography variant="body2" color="white">
            Workspace Devias
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#374151" }} />

      {/* Dashboards Section */}
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <BarChartIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <ShoppingCartIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="E-commerce" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Crypto" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: "#374151" }} />

      {/* General Section */}
      <Typography variant="body2" sx={{ padding: 2, color: "#9CA3AF" }}>
        General
      </Typography>

      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <PeopleIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Customers" />
          </ListItemButton>
        </ListItem>

        <ListItemButton onClick={handleToggle}>
          <ListItemIcon>
            <WorkIcon sx={{ color: "#9CA3AF" }} />
          </ListItemIcon>
          <ListItemText primary="Jobs" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemText primary="Job 1" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemText primary="Job 2" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <LocalShippingIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Logistics" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
