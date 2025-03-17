import { useState } from 'react';
import {
  Box,
  Button,
  CssBaseline,
  FormLabel,
  FormControl,
  TextField,
  Typography,
  IconButton,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';

//  กำหนดโครงสร้าง Layout หลัก
const RootContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  flexDirection: 'row',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    height: 'auto',
  },
}));

const LeftContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: '#FF6700',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '2rem',
  color: '#fff',
  [theme.breakpoints.down('sm')]: {
    padding: '1rem',
  },
}));

const RightContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: {
    padding: '1rem',
  },
}));

const FormContainer = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const StyledButton = styled(Button)({
  backgroundColor: '#F7941E',
  '&:hover': { backgroundColor: '#e6851a' },
  fontSize: '1rem',
  padding: '0.75rem',
  borderRadius: '8px',
});

const HomeButton = styled(IconButton)({
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#FFA64D',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#FF8C00',
  },
});

export default function SignUp() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    setErrors({});
    try {
      const response = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 201) {
        showSnackbar('สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนหน้า...', 'success');
        setTimeout(() => navigate('/signin'), 2000);
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่',
        'error'
      );
    }
  };

  return (
    <>
      <CssBaseline />
      <RootContainer>
        {/*  กล่องซ้าย */}
        <LeftContainer>
          <img
            src="/IT-PMS.svg"
            alt="IT-PMS Logo"
            style={{ width: '60%', maxWidth: '500px' }}
          />
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
            สมัครสมาชิก
          </Typography>
          <Typography variant="body2">
            กรุณากรอกข้อมูลเพื่อสมัครสมาชิก
          </Typography>
        </LeftContainer>

        {/*  กล่องขวา */}
        <RightContainer>
          <FormContainer component="form" onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>ชื่อผู้ใช้</FormLabel>
              <TextField
                id="username"
                name="username"
                type="text"
                placeholder="ชื่อของคุณ"
                fullWidth
                required
                error={!!errors.username}
                helperText={errors.username || ''}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email || ''}
              />
            </FormControl>

            <FormControl>
              <FormLabel>รหัสผ่าน</FormLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password || ''}
              />
            </FormControl>

            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#FF6700',
                '&:hover': { backgroundColor: '#FF8C00' },
                padding: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                mt: '1rem',
                mb: '4rem',
              }}
            >
              สมัครสมาชิก
            </StyledButton>

            <Typography sx={{ textAlign: 'center', mt: 2 }}>
              มีบัญชีอยู่แล้ว?{' '}
              <Link
                onClick={() => navigate('/signin')}
                sx={{ color: '#F7941E', fontWeight: 'bold' }}
              >
                เข้าสู่ระบบที่นี่
              </Link>
            </Typography>
          </FormContainer>

          {/*  ปุ่ม Home */}
          <HomeButton onClick={() => navigate('/')}>
            <HomeIcon />
          </HomeButton>
        </RightContainer>
      </RootContainer>
    </>
  );
}
