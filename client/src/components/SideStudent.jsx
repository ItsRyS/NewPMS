import PropTypes from "prop-types"; // Import PropTypes
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { Home, School, Assignment, Logout } from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom"; // Import useNavigate

const drawerWidth = 240;

const SideStudent = ({ mobileOpen, handleDrawerToggle, setTitle }) => {
  const navigate = useNavigate(); // ใช้ useNavigate สำหรับนำทาง

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/"); // นำทางกลับไปยังหน้าหลัก
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
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
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
