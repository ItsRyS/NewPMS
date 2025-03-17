import React, { useEffect, useState } from 'react';
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
  Skeleton,
} from '@mui/material';
import { NavLink, useNavigate, useOutletContext } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../services/api';
import { useSnackbar } from '../components/ReusableSnackbar';
import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import PlagiarismTwoToneIcon from '@mui/icons-material/PlagiarismTwoTone';
import RateReviewTwoToneIcon from '@mui/icons-material/RateReviewTwoTone';
import UploadFileTwoToneIcon from '@mui/icons-material/UploadFileTwoTone';
// Constants
const drawerWidth = 240;

const COLORS = {
  navbar: '#FF6700', // สี Navbar
  drawer: '#FFB38A', // สี Sidebar ที่เหมาะสม
  divider: '#FFD7B5', // เส้นแบ่งหรือพื้นหลัง Hover
  text: {
    primary: '#000000', // สีข้อความหลัก
    secondary: '#374151', // สีข้อความรอง
  },
};

// Memoized User Info Component
const UserInfo = React.memo(({ username, role, profileImage, loading }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
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
            src={profileImage}
            alt={username}
            sx={{
              width: 100,
              height: 100,
              objectFit: 'cover',
              mx: 'auto',
              border: '2px solid #e0e0e0',
            }}
            onError={(e) => (e.target.src = '/default-avatar.png')}
          />
          <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
            {username}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textTransform: 'capitalize',
              color: 'text.secondary',
            }}
          >
            {role}
          </Typography>
        </>
      )}
      <Divider sx={{ width: '100%', mt: 2 }} />
    </Box>
  );
});

UserInfo.displayName = 'UserInfo';

UserInfo.propTypes = {
  username: PropTypes.string,
  role: PropTypes.string,
  profileImage: PropTypes.string,
  loading: PropTypes.bool,
};

const SideStudent = ({ mobileOpen, handleDrawerToggle, setTitle }) => {
  const [username, setUsername] = useState('Loading...');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(true);
  const showSnackbar = useSnackbar();
  const navigate = useNavigate();

  const outletContext = useOutletContext() || {};

  const updateUserData = (newUsername, newProfileImage) => {
    if (newUsername) setUsername(newUsername);
    if (newProfileImage) {
      const supabaseUrl =
        'https://tgyexptoqpnoxcalnkyo.supabase.co/storage/v1/object/public/profile-images/';
      const fullImageUrl = `${supabaseUrl}${newProfileImage}`;

      // Validate image URL before updating
      const img = new Image();
      img.onload = () => setProfileImage(fullImageUrl);
      img.onerror = () => setProfileImage('/default-avatar.png');
      img.src = fullImageUrl;
    }

    // Update Session
    const updateSession = async () => {
      try {
        await api.post('/auth/update-session', {
          username: newUsername,
          profileImage: newProfileImage,
        });
      } catch (error) {
        console.error('Failed to update session:', error.message);
        showSnackbar('Failed to update session', 'error');
      }
    };
    updateSession();
  };

  outletContext.updateUserData = updateUserData;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/check-session');
        const userData = response.data.user;
        console.log('User Data:', userData);
        setUsername(userData.username);
        setRole(userData.role);

        if (userData.profile_image && userData.profile_image !== 'NULL') {
          setProfileImage(userData.profile_image);
        } else {
          setProfileImage('/default-avatar.png');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setProfileImage('/default-avatar.png');
        navigate('/SignIn');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      navigate('/SignIn');
    } catch (error) {
      console.error('Logout failed:', error);
      showSnackbar('Logout failed', 'error');
    }
  };

  const menuItems = [
    {
      to: '/studentHome',
      text: 'หน้าหลัก',
      icon: <DashboardTwoToneIcon sx={{ color: COLORS.text.secondary }} />,
      title: 'หน้าหลัก',
    },
    {
      to: '/studentHome/ProfileUser',
      text: 'ข้อมูลส่วนตัว',
      icon: <AccountCircleTwoToneIcon sx={{ color: COLORS.text.secondary }} />,
      title: 'ข้อมูลส่วนตัว',
    },
    {
      to: '/studentHome/Documentation',
      text: 'แบบร่างเอกสาร',
      icon: <PlagiarismTwoToneIcon sx={{ color: COLORS.text.secondary }} />,
      title: 'แบบร่างเอกสาร',
    },
    {
      to: '/studentHome/projectRequest',
      text: 'คำร้องโครงการ',
      icon: <RateReviewTwoToneIcon sx={{ color: COLORS.text.secondary }} />,
      title: 'คำร้องโครงการ',
    },
    {
      to: '/studentHome/uploadProjectDocument',
      text: 'ส่งเอกสาร',
      icon: <UploadFileTwoToneIcon sx={{ color: COLORS.text.secondary }} />,
      title: 'ส่งเอกสาร',
    },
  ];

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
        {menuItems.map(({ to, text, icon, title }, index) => (
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
            backgroundColor: COLORS.drawer,
            color: COLORS.text.primary,
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

SideStudent.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default SideStudent;
