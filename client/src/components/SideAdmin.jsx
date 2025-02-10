import React, { useState, useEffect } from 'react';
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
  Skeleton,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSnackbar } from '../components/ReusableSnackbar';
import api ,{ API_BASE_URL } from '../services/api';

// Constants
const drawerWidth = 240;
const COLORS = {
  drawer: '#2d3a46',
  divider: '#374151',
  text: {
    primary: '#ffffff',
    secondary: '#9CA3AF',
  },
};

// Memoized User Info Component
const UserInfo = React.memo(({ username, role, profileImage, loading }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 2,
      minHeight: { xs: 'auto', sm: '200px' },
    }}
  >
    {loading ? (
      <>
        <Skeleton variant="circular" width={100} height={100} />
        <Skeleton variant="text" width={120} sx={{ mt: 1 }} />
        <Skeleton variant="text" width={80} />
      </>
    ) : (
      <>
        <Avatar
          src={
            profileImage
              ? `${API_BASE_URL}/${profileImage}`
              : '/default-avatar.png'
          }
          alt={username}
          sx={{ width: 100, height: 100 }}
        />
        <Typography
          variant="body1"
          sx={{
            color: COLORS.text.primary,
            marginTop: 1,
            display: { xs: 'none', sm: 'block' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {username}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: COLORS.text.secondary,
            display: { xs: 'none', sm: 'block' },
            textTransform: 'capitalize',
          }}
        >
          {role}
        </Typography>
      </>
    )}
    <Divider sx={{ borderColor: '#ff0000', width: '100%', mt: 2 }} />
  </Box>
));

UserInfo.displayName = 'UserInfo';

UserInfo.propTypes = {
  username: PropTypes.string,
  role: PropTypes.string,
  profileImage: PropTypes.string,
  loading: PropTypes.bool,
};

const SideAdmin = ({ mobileOpen, handleDrawerToggle, setTitle }) => {
  const [username, setUsername] = useState('Loading...');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get('/auth/check-session', {
          headers: { 'x-tab-id': sessionStorage.getItem('tabId') },
        });
        if (response.data.isAuthenticated) {
          setUsername(response.data.user.username);
          setRole(response.data.user.role);
          setProfileImage(response.data.user.profileImage);
        } else {
          navigate('/SignIn');
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        showSnackbar(
          error.response?.data?.message || 'Failed to load user data',
          'error'
        );
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
      <UserInfo
        username={username}
        role={role}
        profileImage={profileImage}
        loading={loading}
      />

      <List>
        <ListItem>
          <ListItemText primary="หมวดจัดการ" sx={{ color: COLORS.text.secondary }} />
        </ListItem>
        <List component="div" disablePadding>
          {[
            {
              to: '/adminHome',
              text: 'หน้าหลัก',
              icon: <DashboardIcon sx={{ color: COLORS.text.secondary }} />,
              title: 'หน้าหลัก',
            },
            {
              to: '/adminHome/manage-user',
              text: 'จัดการผู้ใช้',
              icon: <PeopleIcon sx={{ color: COLORS.text.secondary }} />,
              title: 'จัดการผู้ใช้',
            },
            {
              to: '/adminHome/upload-doc',
              text: 'เพิ่มแบบฟอร์มเอกสาร',
              icon: <CloudUploadIcon sx={{ color: COLORS.text.secondary }} />,
              title: 'เพิ่มแบบฟอร์มเอกสาร',
            },
            {
              to: '/adminHome/TeacherInfo',
              text: 'ข้อมูลอาจารย์',
              icon: <PeopleIcon sx={{ color: COLORS.text.secondary }} />,
              title: 'ข้อมูลอาจารย์',
            },
          ].map(({ to, text, icon, title }, index) => (
            <NavLink
              key={index}
              to={{
                pathname: to,
                search: `?reload=${Date.now()}`,
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
          <ListItemText primary="หมวดโครงงาน" sx={{ color: COLORS.text.secondary }} />
        </ListItem>
        <List component="div" disablePadding>
          {[
            {
              to: '/adminHome/project-types',
              text: 'จัดการประเภทโครงการ',
              icon: <CloudUploadIcon sx={{ color: COLORS.text.secondary }} />,
              title: 'จัดการประเภทโครงการ',
            },
            {
              to: '/adminHome/CheckProject',
              text: 'อนุมัติโครงการ',
              icon: <CheckCircleIcon sx={{ color: COLORS.text.secondary }} />,
              title: 'อนุมัติโครงการ',
            },
            {
              to: '/adminHome/ViewProjectDocuments',
              text: 'ตรวจเอกสาร',
              icon: <CloudUploadIcon sx={{ color: COLORS.text.secondary }} />,
              title: 'ตรวจเอกสาร',
            },
            {
              to: '/adminHome/release-project',
              text: 'เผยแพร่โครงการ',
              icon: <CloudUploadIcon sx={{ color: COLORS.text.secondary }} />,
              title: 'เผยแพร่โครงการ',
            },
          ].map(({ to, text, icon, title }, index) => (
            <NavLink
              key={index}
              to={{
                pathname: to,
                search: `?reload=${Date.now()}`,
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

      <Divider sx={{ borderColor: COLORS.divider, mt: 2 }} />
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
            backgroundColor: COLORS.drawer,
            color: COLORS.text.primary,
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