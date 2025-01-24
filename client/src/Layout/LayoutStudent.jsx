import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import SideStudent from '../components/SideStudent';
import NavStudent from '../components/NavStudent';
import { Box, Toolbar } from '@mui/material';

const LayoutStudent = () => {
  const [mobileOpen, setMobileOpen] = useState(false); // เพิ่ม State สำหรับ Drawer
  const [title, setTitle] = useState('Dashboard');
  const [profileImage, setProfileImage] = useState(''); // State สำหรับรูปภาพ

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen); // สลับสถานะ Drawer
  };
  const updateProfileImage = (newImagePath) => {
    setProfileImage(newImagePath); // อัปเดตรูปภาพ
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavStudent handleDrawerToggle={handleDrawerToggle} title={title} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <SideStudent
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          setTitle={setTitle}
          profileImage={profileImage}
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
            width: '100%', // ขยายเต็มความกว้าง
          }}
        >
          <Toolbar />
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet context={{ updateProfileImage }}/>
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutStudent