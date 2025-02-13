import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import LoginTwoToneIcon from '@mui/icons-material/LoginTwoTone';
import AssignmentIndTwoToneIcon from '@mui/icons-material/AssignmentIndTwoTone';

const menuItems = [
  {
    text: 'คณะอาจารย์',
    icon: <AssignmentIndTwoToneIcon />,
    to: '/TeacherPage',
    color: '#000000',
    variant: 'text',
  },
  {
    text: 'โครงงานเก่า',
    icon: <AssignmentIndTwoToneIcon />,
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
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#FFA64D',
        width: '100%',
        zIndex: 99,
        paddingX: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Enhanced Logo Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
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
            <img
              src="/PMS-logo2.svg"
              alt="IT-PMS Logo"
              style={{
                height: '48px',
                width: 'auto',
                marginRight: '12px',
                filter: 'drop-shadow(0 2px 2px rgb(0, 0, 0))',
              }}
            />
          </Link>
        </Box>

        {/* Enhanced Menu Items */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3, // Increased gap between items
            ml: 'auto',
          }}
        >
          {menuItems.map(({ text, icon, to, variant, color, fontWeight }, index) => (
            <Button
              key={index}
              component={Link}
              to={to}
              startIcon={
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  transform: 'scale(1.2)', // Larger icons
                }}>
                  {icon}
                </Box>
              }
              variant={variant}
              color={color || 'inherit'}
              sx={{
                fontSize: '1rem', // Slightly larger font
                fontWeight: fontWeight || 500, // Bolder text
                transition: 'all 0.2s ease-in-out',
                padding: '10px 20px', // Larger padding
                borderRadius: '10px', // More rounded corners
                textTransform: 'none', // Preserve original text case
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  backgroundColor: variant === 'contained'
                    ? ''
                    : 'rgba(255,255,255,0.2)',
                  '&::after': {
                    opacity: 1,
                    transform: 'scaleX(1)',
                  }
                },
                '&::after': variant === 'text' ? {
                  content: '""',
                  position: 'absolute',
                  bottom: '5px',
                  left: '10%',
                  width: '80%',
                  height: '2px',
                  backgroundColor: '#000000',
                  opacity: 0,
                  transform: 'scaleX(0)',
                  transition: 'all 0.2s ease-in-out',
                } : {},
                ...(variant === 'contained' && {
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                  }
                }),
              }}
            >
              {text}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarHome;