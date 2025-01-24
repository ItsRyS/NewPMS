import { useState } from 'react';
import { Box, Button, CssBaseline, FormLabel, FormControl, TextField, Typography, Stack, Card, Link } from '@mui/material';
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

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
}));

// สร้าง Zod Schema สำหรับ Sign Up
const signUpSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export default function SignUp() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const showSnackbar = useSnackbar(); // ดึงฟังก์ชัน showSnackbar จาก context

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      username: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    // ตรวจสอบข้อมูลด้วย Zod
    try {
      signUpSchema.parse(data); // ถ้าผ่านจะทำงานต่อไป
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = err.formErrors?.fieldErrors || {};
        setErrors({
          username: fieldErrors.username ? fieldErrors.username[0] : '',
          email: fieldErrors.email ? fieldErrors.email[0] : '',
          password: fieldErrors.password ? fieldErrors.password[0] : '',
        });
      }
      return; // ถ้า Error ไม่เรียก API ต่อ
    }

    // ไม่มี Error -> เคลียร์ Errors
    setErrors({});

    // เรียก API
    try {
      const response = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 201) {
        // แสดง Snackbar สำเร็จ
        showSnackbar('Sign up successful! Redirecting to sign in.', 'success');

        // Redirect
        setTimeout(() => navigate('/signin'), 2000);
      }
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Connection failed.', 'error');
    }
  };

  return (
    <>
      <CssBaseline />
      <SignUpContainer direction="column" justifyContent="space-between">
        <StyledCard variant="outlined">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={4} sx={{ mb: 4 }}>
            <Box sx={{ width: '60px', height: '60px' }}>
              <img src="/PMS-logo2.svg" alt="IT-PMS Logo" style={{ width: '100%', height: '100%', objectFit: 'scale-down' }} />
            </Box>
            <Typography component="h1" variant="h4" sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center' }}>
              Sign up
            </Typography>
          </Stack>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Name */}
            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <TextField
                id="name"
                name="name"
                type="text"
                placeholder="Incognito user"
                autoComplete="name"
                required
                fullWidth
                error={!!errors.username}
                helperText={errors.username || ''}
              />
            </FormControl>

            {/* Email */}
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="your@gmail.com"
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

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Button type="submit" variant="contained" size="large" sx={{ px: 4 }}>
                Sign up
              </Button>
              <Button onClick={() => navigate('/')} variant="outlined" size="large" sx={{ px: 4 }}>
                Back to Home
              </Button>
            </Box>

            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/signin" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
        </StyledCard>
      </SignUpContainer>
    </>
  );
}