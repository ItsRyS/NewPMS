import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#4A628A",
          position: "fixed",
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

          {/* Login Button */}
          <Button color="inherit" component={Link} to="/signIn">
            Login
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
