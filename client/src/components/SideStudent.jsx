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
import { useSnackbar } from '../components/ReusableSnackbar';

const drawerWidth = 240;

const SideStudent = ({ mobileOpen, handleDrawerToggle, setTitle }) => {
  const [username, setUsername] = useState('Loading...');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(true);
  const showSnackbar = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get('/auth/check-session', {
          headers: { 'x-tab-id': sessionStorage.getItem('tabId') },
        });
        if (response.data.isAuthenticated) {
          setUsername(response.data.user.username);
          setProfileImage(response.data.user.profileImage);
        } else {
          navigate('/SignIn');
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        showSnackbar('Failed to load session data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [navigate, showSnackbar]);

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
      showSnackbar('Logout failed', 'error');
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
              ? `http://localhost:5000/${profileImage}`
              : '/default-avatar.png'
          }
          alt="Profile"
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
        {[
          {
            to: '/studentHome',
            text: 'หนักหลัก',
            icon: <Home sx={{ color: '#9CA3AF' }} />,
            title: 'หนักหลัก',
          },
          {
            to: '/studentHome/ProfileUser',
            text: 'ข้อมูลส่วนตัว',
            icon: <Home sx={{ color: '#9CA3AF' }} />,
            title: 'ข้อมูลส่วนตัว',
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
            to={{ pathname: to }}
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

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

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
  profileImage: PropTypes.string, // เพิ่ม PropTypes
};

export default SideStudent;
