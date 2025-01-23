import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { Box } from '@mui/material';

const LayoutMain = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Full height of the viewport
        width: '100%', // Full width of the viewport
        overflow: 'hidden',
      }}
    >
      {/* Navbar
      <NavbarHome />*/}

      {/* Main Content */}
      <Box sx={{ flex: 1,width: '100%' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </Box>

      {/* Footer
      <FooterHome />*/}
    </Box>
  );
};

export default LayoutMain;
