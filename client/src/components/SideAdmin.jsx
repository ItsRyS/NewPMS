import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Button,
  Toolbar,
  ListItem,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import LogoutIcon from '@mui/icons-material/Logout';
import api from '../services/api';

const drawerWidth = 240;

const SideAdmin = ({ mobileOpen, handleDrawerToggle, setTitle }) => {
  const [username, setUsername] = useState('Loading...');
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get('/auth/check-session', {
          headers: { 'x-tab-id': sessionStorage.getItem('tabId') },
        });
        if (response.data.isAuthenticated) {
          setUsername(response.data.user.username);
          setProfileImage(response.data.user.profileImage);
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      const tabId = sessionStorage.getItem('tabId');
      if (!tabId) return;

      const response = await api.post('/auth/logout', { tabId });
      if (response.data.success) {
        sessionStorage.removeItem('tabId');
        navigate('/SignIn');
      }
    } catch (error) {
      console.error('Logout failed:', error.response?.data || error.message);
    }
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 2,
        }}
      >
        <Avatar
          src={
            profileImage
              ? `https://newpms.onrender.com/${profileImage}`
              : '/default-avatar.png'
          } // เพิ่ม fallback
          alt={username}
          sx={{ width: 100, height: 100 }}
        />
        <Typography
          variant="body1"
          sx={{
            color: '#ffffff',
            marginTop: 1,
            display: { xs: 'none', sm: 'block' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {username}
        </Typography>
        <Divider sx={{ borderColor: '#ff0000', width: '100%', mt: 2 }} />
      </Box>

      <List>
        <ListItem>
          <ListItemText primary="หมวดจัดการ" sx={{ color: '#9CA3AF' }} />
        </ListItem>
        <List component="div" disablePadding>
          {[
            {
              to: '/adminHome',
              text: 'หน้าหลัก',
              icon: <DashboardIcon sx={{ color: '#9CA3AF' }} />,
              title: 'หน้าหลัก',
            },
            {
              to: '/adminHome/manage-user',
              text: 'จัดการผู้ใช้',
              icon: <PeopleIcon sx={{ color: '#9CA3AF' }} />,
              title: 'จัดการผู้ใช้',
            },
            {
              to: '/adminHome/upload-doc',
              text: 'เพิ่มแบบฟอร์มเอกสาร',
              icon: <CloudUploadIcon sx={{ color: '#9CA3AF' }} />,
              title: 'เพิ่มแบบฟอร์มเอกสาร',
            },
            {
              to: '/adminHome/TeacherInfo',
              text: 'ข้อมูลอาจารย์',
              icon: <PeopleIcon sx={{ color: '#9CA3AF' }} />,
              title: 'ข้อมูลอาจารย์',
            },
          ].map(({ to, text, icon, title }, index) => (
            <NavLink
              key={index}
              to={{
                pathname: to,
                search: `?reload=${Date.now()}`, // เพิ่ม query parameter
              }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemButton onClick={() => setTitle(title)} sx={{ pl: 4 }}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </NavLink>
          ))}
        </List>

        <ListItem>
          <ListItemText primary="หมวดโครงงาน" sx={{ color: '#9CA3AF' }} />
        </ListItem>
        <List component="div" disablePadding>
          {[
            {
              to: '/adminHome/project-types',
              text: 'จัดการประเภทโครงการ',
              icon: <CloudUploadIcon sx={{ color: '#9CA3AF' }} />,
              title: 'จัดการประเภทโครงการ',
            },

            {
              to: '/adminHome/CheckProject',
              text: 'อนุมัติโครงการ',
              icon: <CheckCircleIcon sx={{ color: '#9CA3AF' }} />,
              title: 'อนุมัติโครงการ',
            },
            {
              to: '/adminHome/ViewProjectDocuments',
              text: 'ตรวจเอกสาร',
              icon: <CloudUploadIcon sx={{ color: '#9CA3AF' }} />,
              title: 'ตรวจเอกสาร',
            },
            {
              to: '/adminHome/release-project',
              text: 'ปล่อยโครงการ',
              icon: <CloudUploadIcon sx={{ color: '#9CA3AF' }} />,
              title: 'ปล่อยโครงการ',
            },

          ].map(({ to, text, icon, title }, index) => (
            <NavLink
              key={index}
              to={{
                pathname: to,
                search: `?reload=${Date.now()}`, // เพิ่ม query parameter
              }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemButton onClick={() => setTitle(title)} sx={{ pl: 4 }}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </NavLink>
          ))}
        </List>
      </List>

      <Divider sx={{ borderColor: '#374151', mt: 2 }} />
      <Box sx={{ padding: 2 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
        >
          ออกจากระบบ
        </Button>
      </Box>
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
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            padding: 1,
            overflowY: 'auto',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#2d3a46',
            color: '#ffffff',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

SideAdmin.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default SideAdmin;
