import { useState } from "react";
import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Collapse } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import FormatTextdirectionLToRIcon from "@mui/icons-material/FormatTextdirectionLToR";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import WidgetsIcon from "@mui/icons-material/Widgets";
import StarIcon from "@mui/icons-material/Star";

export default function SideAdmin() {
  const [openComponents, setOpenComponents] = useState(false);

  const handleToggleComponents = () => {
    setOpenComponents(!openComponents);
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
          backgroundColor: "#01153e",
          color: "#ffffff",
        },
      }}
    >
      <Box sx={{ padding: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Logo */}
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
          COREUI REACT.JS
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "#374151" }} />

      {/* Main Menu */}
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <DashboardIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <Typography variant="body2" sx={{ padding: 2, color: "#9CA3AF" }}>
          Theme
        </Typography>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <ColorLensIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Colors" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <FormatTextdirectionLToRIcon sx={{ color: "#9CA3AF" }} />
            </ListItemIcon>
            <ListItemText primary="Typography" />
          </ListItemButton>
        </ListItem>

        <Typography variant="body2" sx={{ padding: 2, color: "#9CA3AF" }}>
          Components
        </Typography>

        <ListItemButton onClick={handleToggleComponents}>
          <ListItemIcon>
            <WidgetsIcon sx={{ color: "#9CA3AF" }} />
          </ListItemIcon>
          <ListItemText primary="Components" />
          {openComponents ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={openComponents} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <StarIcon sx={{ color: "#9CA3AF" }} />
              </ListItemIcon>
              <ListItemText primary="Buttons" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <StarIcon sx={{ color: "#9CA3AF" }} />
              </ListItemIcon>
              <ListItemText primary="Forms" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
