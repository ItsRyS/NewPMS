// filepath: f:\lptc-it\lptc-client\src\Layout\LayoutAdmin.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import SideAdmin from '../components/SideAdmin';
import { Box, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const LayoutAdmin = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <SideAdmin
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: { sm: '240px' },
            padding: 2,
            overflowY: 'auto',
            width: '100%',
          }}
        >
          <Toolbar
            sx={{
              minHeight: '48px', // ปรับความสูงของ Toolbar
              display: { sm: 'none' }, // ซ่อน Toolbar ในหน้าจอขนาดใหญ่
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutAdmin;