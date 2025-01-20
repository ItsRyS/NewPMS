import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Divider,
  Typography,
  Avatar,
  Toolbar,
} from '@mui/material';
import { Home, School, Assignment, PresentToAll } from '@mui/icons-material';
import { NavLink, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../services/api';

const drawerWidth = 240;

const SideStudent = ({ mobileOpen, handleDrawerToggle, setTitle }) => {
  const [username, setUsername] = useState('Loading...');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await api.get('/auth/check-session');
        if (response.data.isAuthenticated) {
          setUsername(response.data.user.username);
        }
      } catch (error) {
        console.error('Failed to fetch session info:', error);
      }
    };
    fetchUsername();
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
        <Avatar alt={username} src="https://i.pravatar.cc/300" />
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
        {[
          {
            to: '/studentHome',
            text: 'หนักหลัก',
            icon: <Home sx={{ color: '#9CA3AF' }} />,
            title: 'หนักหลัก',
          },
          {
            to: '/studentHome/Documentation',
            text: 'แบบร่างเอกสาร',
            icon: <School sx={{ color: '#9CA3AF' }} />,
            title: 'แบบร่างเอกสาร',
          },
          {
            to: '/studentHome/projectRequest',
            text: 'คำร้องโครงการ',
            icon: <Assignment sx={{ color: '#9CA3AF' }} />,
            title: 'คำร้องโครงการ',
          },
          {
            to: '/studentHome/uploadProjectDocument',
            text: 'ส่งเอกสาร',
            icon: <PresentToAll sx={{ color: '#9CA3AF' }} />,
            title: 'ส่งเอกสาร',
          },
        ].map(({ to, text, icon, title }, index) => (
          <NavLink
            key={index}
            to={{
              pathname: to,
              search: `?reload=${Date.now()}`, // เพิ่ม query parameter เพื่อกระตุ้นการโหลดใหม่
            }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItemButton onClick={() => setTitle(title)}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </NavLink>
        ))}
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

SideStudent.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default SideStudent;
