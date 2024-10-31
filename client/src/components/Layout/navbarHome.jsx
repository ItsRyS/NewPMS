import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const NavbarHome = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#01153e",
          top: 0,
          width: "100%",
          zIndex: 99,
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: "bold", flexGrow: 1, color: "#ffffff" }}
          >
            <span style={{ color: "#ff8000" }}>IT</span>-PMS
          </Typography>
          {/* Menu Items */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button
              color="inherit"
              startIcon={<MenuBookIcon />}
              component={Link}
              to="/courses"
            >
              หลักสูตรคุณภาพสูง
            </Button>
            <Button
              color="inherit"
              startIcon={<HandshakeIcon />}
              component={Link}
              to="/services"
            >
              บริการของเรา
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<PlayArrowIcon />}
              component={Link}
              to="/SignIn" // Link to the SignIn route
              sx={{
                fontWeight: "bold",
                color: "#222",
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavbarHome;
