
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, useTheme, useMediaQuery } from "@mui/material";

import PropTypes from "prop-types";

export default function NavAdmin({ onMenuClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        color: "#333",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: isMobile ? "100%" : "calc(100% - 240px)",
        ml: isMobile ? 0 : "240px",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ color: "#333", fontWeight: "bold" }}>
          <Box>
            <img
              src="/it_logo2.svg"
              alt="IT-PMS Logo"
              style={{ height: "60px", width: "auto", marginRight: "8px" }}
            />
          </Box>
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

NavAdmin.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};
