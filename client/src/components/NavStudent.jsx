
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const NavStudent = ({ handleDrawerToggle, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#01153e",
        color: "#fff",
        width: isMobile ? "100%" : "calc(100% - 240px)",
        ml: isMobile ? 0 : "240px",
        height: theme => theme.mixins.toolbar.minHeight, // กำหนดความสูง

      }}
    >
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
  handleDrawerToggle: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default NavStudent;
