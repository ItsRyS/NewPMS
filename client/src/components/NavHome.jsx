import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import { Link } from 'react-router-dom';
import LoginTwoToneIcon from '@mui/icons-material/LoginTwoTone';
import FindInPageTwoToneIcon from '@mui/icons-material/FindInPageTwoTone';
import { Typography } from '@mui/material';
import Groups3TwoToneIcon from '@mui/icons-material/Groups3TwoTone';
const menuItems = [
  {
    text: 'คณะอาจารย์',
    icon: <Groups3TwoToneIcon />,
    to: '/TeacherPage',
    color: '#000000',
    variant: 'squared',
  },
  {
    text: 'โครงงานเก่า',
    icon: <FindInPageTwoToneIcon />,
    to: '/OldProject',
    variant: 'text',
    color: '#000000',
    fontWeight: 'bold',
  },
  {
    text: 'เข้าสู่ระบบ',
    icon: <LoginTwoToneIcon />,
    to: '/SignIn',
    variant: 'contained',
    color: 'warning',
    fontWeight: 'bold',
  },
];

const NavbarHome = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = (open) => () => setMobileOpen(open);

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#FF6700',
        width: '100%',
        zIndex: 99,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // เพิ่มเงาให้ AppBar
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          edge="start"
          sx={{ display: { xs: 'block', sm: 'none' } }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo & Title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontWeight: 600,
                ml: 0.5, // ปรับระยะห่างจากโลโก้
                textShadow: '6px 1px 1px rgba(0, 0, 0, 0.2)', // เพิ่มเงาให้ตัวอักษร
                '&:hover': { color: '#FFF4F4' },
              }}
            >
              <span style={{ color: '#FFFFFF' }}>IT</span>
              <span style={{ color: '#000000' }}>-PMS</span>
            </Typography>
          </Link>
        </Box>

        {/* Desktop Menu */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 3, ml: 'auto' }}>
          {menuItems.map(({ text, icon, to }, index) => (
            <Button
              key={index}
              component={Link}
              to={to}
              variant="text"
              sx={{
                fontSize: '1rem',
                color: '#000',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { color: '#FFF4F4' },
              }}
            >
              {icon} {text}
            </Button>
          ))}
        </Box>

        {/* Mobile Drawer Menu */}
        <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 250, padding: '16px' }}>
            {menuItems.map(({ text, to }, index) => (
              <Button
                key={index}
                component={Link}
                to={to}
                fullWidth
                sx={{
                  fontSize: '1rem',
                  color: '#000',
                  fontWeight: 500,
                  '&:hover': { color: '#FF5722' },
                }}
              >
                {text}
              </Button>
            ))}
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarHome;
