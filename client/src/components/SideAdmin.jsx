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
  Button,

  ListItem,
  Skeleton,
} from '@mui/material';
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone"
import NoteAddTwoToneIcon from "@mui/icons-material/NoteAddTwoTone";
import NewReleasesTwoToneIcon from "@mui/icons-material/NewReleasesTwoTone";
import { NavLink, useNavigate } from 'react-router-dom';
import DashboardTwoToneIcon from "@mui/icons-material/DashboardTwoTone";
import PeopleAltTwoToneIcon from "@mui/icons-material/PeopleAltTwoTone";
import TypeSpecimenTwoToneIcon from "@mui/icons-material/TypeSpecimenTwoTone";
import AssignmentTurnedInTwoToneIcon from "@mui/icons-material/AssignmentTurnedInTwoTone";
import LogoutIcon from '@mui/icons-material/Logout';
import { useSnackbar } from '../components/ReusableSnackbar';
import api from '../services/api';
import UploadFileTwoToneIcon from "@mui/icons-material/UploadFileTwoTone"
// Constants
const drawerWidth = 240;

const COLORS = {
  navbar: '#4B49AC', // สี Navbar
  drawer: '#2f456f', // สี Sidebar ที่เหมาะสม
  divider: '#eff5fa', // เส้นแบ่งหรือพื้นหลัง Hover
  text: {
    primary: '#FFFFFF', // สีข้อความหลัก
    secondary: '#FF6700', // สีข้อความรอง
    iconcolor: '#FF6700', // สีไอคอน
  },
};


// Memoized User Info Component
const UserInfo = React.memo(({ username, role, loading }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 2 }}>
    {loading ? (
      <>
        <Skeleton variant="circular" width={100} height={100} />
        <Skeleton variant="text" width={120} sx={{ mt: 1 }} />
        <Skeleton variant="text" width={80} />
      </>
    ) : (
      <>

        <Typography variant="body1" sx={{ color: COLORS.text.primary, mt: 1 }}>
          {username}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.text.secondary, textTransform: "capitalize" }}>
          {role}
        </Typography>
      </>
    )}
    <Divider sx={{ width: "100%", mt: 2 , borderColor: COLORS.divider }} />
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
    const checkSession = async () => {
      try {
        const response = await api.get("/auth/check-session");
        setUsername(response.data.user.username);
        setRole(response.data.user.role);
        setProfileImage(response.data.user.profileImage);
      } catch {
        navigate("/SignIn");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      navigate("/SignIn");
    } catch {
      showSnackbar("Logout failed", "error");
    }
  };

  const drawerContent = (
    <>

      <UserInfo
        username={username}
        role={role}
        profileImage={profileImage}
        loading={loading}
      />

      <List>
        <ListItem>
          <ListItemText primary="หมวดจัดการ" sx={{ color: COLORS.text.primary }} />
        </ListItem>
        <List component="div" disablePadding sx={{ color: COLORS.text.primary }}>
          {[
            {
              to: '/adminHome',
              text: 'หน้าหลัก',
              icon: <DashboardTwoToneIcon />,
              title: 'หน้าหลัก',
            },
            {
              to: '/adminHome/manage-user',
              text: 'จัดการผู้ใช้',
              icon: <PeopleAltTwoToneIcon />,
              title: 'จัดการผู้ใช้',
            },
            {
              to: '/adminHome/TeacherInfo',
              text: 'ข้อมูลอาจารย์',
              icon: <PeopleAltTwoToneIcon />,
              title: 'ข้อมูลอาจารย์',
            },
            {
              to: '/adminHome/upload-doc',
              text: 'เพิ่มแบบฟอร์มเอกสาร',
              icon: <UploadFileTwoToneIcon />,
              title: 'เพิ่มแบบฟอร์มเอกสาร',
            },
            {
              to: '/adminHome/project-types',
              text: 'จัดการประเภทโครงการ',
              icon: <TypeSpecimenTwoToneIcon />,
              title: 'จัดการประเภทโครงการ',
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
              <ListItemButton onClick={() => setTitle(title)} sx={{ pl: 4, '&:hover': { color: '#FFF4F4' } }}>
                <ListItemIcon sx={{ color: COLORS.text.iconcolor }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </NavLink>
          ))}
        </List>

        <ListItem>
          <ListItemText primary="หมวดโครงงาน" sx={{ color: COLORS.text.primary }} />
        </ListItem>
        <List component="div" disablePadding>
          {[

            {
              to: '/adminHome/CheckProject',
              text: 'อนุมัติโครงการ',
              icon: <CheckCircleTwoToneIcon />,
              title: 'อนุมัติโครงการ',
            },
            {
              to: '/adminHome/ViewProjectDocuments',
              text: 'ตรวจเอกสารโครงงาน',
              icon: <AssignmentTurnedInTwoToneIcon />,
              title: 'ตรวจเอกสารโครงงาน',
            },
            {
              to: '/adminHome/release-project',
              text: 'เผยแพร่โครงการ',
              icon: <NewReleasesTwoToneIcon />,
              title: 'เผยแพร่โครงการ',
            },
            {
              to: '/adminHome/AddOldProject',
              text: 'เพิ่มเอกสารโครงงานเก่า',
              icon: <NoteAddTwoToneIcon />,
              title: 'เพิ่มเอกสารโครงงานเก่า',
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
              <ListItemButton onClick={() => setTitle(title)} sx={{ pl: 4, '&:hover': { color: '#FFF4F4' } }}>
                <ListItemIcon sx={{ color: COLORS.text.iconcolor }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </NavLink>
          ))}
        </List>
      </List>


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
            backgroundColor: mobileOpen ? '#2f456f' : COLORS.drawer,
            color: mobileOpen ? '#FFFFFF' : COLORS.text.primary,
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