import PropTypes from "prop-types"; // Import PropTypes
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Button,
  Divider,
} from "@mui/material";
import { Home, School, Assignment } from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom"; // Import useNavigate
import api from "../services/api";
import LogoutIcon from "@mui/icons-material/Logout";
const drawerWidth = 240;

const SideStudent = ({ mobileOpen, handleDrawerToggle, setTitle }) => {
  const navigate = useNavigate(); // ใช้ useNavigate สำหรับนำทาง

  const handleLogout = async () => {
    try {
      const tabId = sessionStorage.getItem("tabId");
      console.log("Tab ID from sessionStorage:", tabId);

      if (!tabId) {
        console.error("No tabId found in sessionStorage");
        return;
      }

      const response = await api.post("/auth/logout", { tabId });
      if (response.data.success) {
        console.log("Logout successful:", response.data.message);
        sessionStorage.removeItem("tabId");
        navigate("/SignIn");
      } else {
        console.error("Logout failed:", response.data);
      }
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        <NavLink
          to="/studentHome"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("Dashboard")}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </NavLink>
        <NavLink
          to="/studentHome/Documentation"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("Documentation")}>
            <ListItemIcon>
              <School />
            </ListItemIcon>
            <ListItemText primary="Documentation" />
          </ListItemButton>
        </NavLink>
        <NavLink
          to="/studentHome/projectRequest"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("Project Request")}>
            <ListItemIcon>
              <Assignment />
            </ListItemIcon>
            <ListItemText primary="Project Request" />
          </ListItemButton>
        </NavLink>
        <NavLink
          to="/studentHome/SendProject"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ListItemButton onClick={() => setTitle("Send Project")}>
            <ListItemIcon>
              <Assignment />
            </ListItemIcon>
            <ListItemText primary="Send Project" />
          </ListItemButton>
        </NavLink>
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
      </List>
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
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

SideStudent.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default SideStudent;
