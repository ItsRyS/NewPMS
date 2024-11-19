import PropTypes from "prop-types"; // Import PropTypes
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const NavStudent = ({ handleDrawerToggle, title = "Dashboard" }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: "none" } }}
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

NavStudent.propTypes = {
  handleDrawerToggle: PropTypes.func.isRequired, // handleDrawerToggle ต้องเป็นฟังก์ชัน
  title: PropTypes.string, // รับ title เป็น props (ไม่จำเป็น)
};

export default NavStudent;
