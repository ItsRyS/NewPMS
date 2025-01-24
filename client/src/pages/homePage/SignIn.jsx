import { useState, useEffect } from 'react';
import { Box, Button, CssBaseline, FormControlLabel,Checkbox, FormLabel, FormControl, TextField, Typography, Stack, Card, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';

// สร้าง Styled Component สำหรับ Layout
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  backgroundColor: '#ffffff',
  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.up('sm')]: { maxWidth: '450px' },
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
}));

// สร้าง Zod Schema สำหรับ Sign In
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export default function SignIn() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const showSnackbar = useSnackbar(); // ดึงฟังก์ชัน showSnackbar จาก context

  // สร้าง tabId ให้แต่ละแท็บ (sessionStorage) ในกรณีที่ยังไม่มี
  useEffect(() => {
    if (!sessionStorage.getItem('tabId')) {
      sessionStorage.setItem('tabId', `${Date.now()}-${Math.random()}`);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };
    const tabId = sessionStorage.getItem('tabId');

    // ตรวจสอบข้อมูลด้วย Zod
    try {
      signInSchema.parse(data); // ถ้าผ่านจะทำงานต่อไป
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = err.formErrors?.fieldErrors || {};
        setErrors({
          email: fieldErrors.email ? fieldErrors.email[0] : '',
          password: fieldErrors.password ? fieldErrors.password[0] : '',
        });
      }
      return; // หากมี error ไม่ต้องเรียก API
    }

    // ไม่มี Error -> เคลียร์ Errors ก่อน
    setErrors({});

    // เรียก API
    try {
      const response = await api.post('/auth/login', { ...data, tabId }, { withCredentials: true });
      const { role } = response.data;

      // แจ้งเตือนผ่าน Snackbar
      showSnackbar('Sign in successful!', 'success');

      // เมื่อสำเร็จ ให้ redirect หน้า
      setTimeout(() => {
        if (role === 'teacher') {
          navigate('/adminHome');
        } else {
          navigate('/studentHome');
        }
      }, 1500);
    } catch (error) {
      // แสดงข้อผิดพลาดผ่าน Snackbar
      showSnackbar(error.response?.data?.error || 'Sign-in failed. Please check your credentials.', 'error');
    }
  };

  return (
    <>
      <CssBaseline />
      <SignInContainer direction="column" justifyContent="space-between">
        <StyledCard variant="outlined">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={4} sx={{ mb: 4 }}>
            <Box sx={{ width: '60px', height: '60px' }}>
              <img src="/PMS-logo2.svg" alt="IT-PMS Logo" style={{ width: '100%', height: '100%', objectFit: 'scale-down' }} />
            </Box>
            <Typography component="h1" variant="h4" sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center' }}>
              Sign in
            </Typography>
          </Stack>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Email */}
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                fullWidth
                error={!!errors.email}
                helperText={errors.email || ''}
              />
            </FormControl>

            {/* Password */}
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
                autoComplete="current-password"
                required
                fullWidth
                error={!!errors.password}
                helperText={errors.password || ''}
              />
            </FormControl>

            <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Button type="submit" variant="contained" size="large" sx={{ px: 4 }}>
                Sign in
              </Button>
              <Button onClick={() => navigate('/')} variant="outlined" size="large" sx={{ px: 4 }}>
                Back to Home
              </Button>
            </Box>

            <Typography sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" variant="body2">
                Sign up
              </Link>
            </Typography>
          </Box>
        </StyledCard>
      </SignInContainer>
    </>
  );
}