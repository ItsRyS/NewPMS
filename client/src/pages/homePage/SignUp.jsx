import { useState } from 'react';
import { Box, Button, CssBaseline, FormLabel, FormControl, TextField, Typography, Stack, Card, Link, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

export default function SignUp() {
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const navigate = useNavigate();

  const validateInputs = ({ username, email, password }) => {
    const newErrors = {
      username: !username.trim() ? 'Username is required.' : '',
      email: !/\S+@\S+\.\S+/.test(email) ? 'Please enter a valid email address.' : '',
      password: password.length < 6 ? 'Password must be at least 6 characters long.' : '',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === ''); // ตรวจสอบว่าไม่มีข้อผิดพลาด
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { name: username, email, password } = Object.fromEntries(new FormData(event.currentTarget).entries());

    if (!validateInputs({ username, email, password })) return;

    try {
      const response = await api.post('/auth/register', { username, email, password }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 201) {
        setSnackbar({ open: true, message: 'Sign up successful! Redirecting to sign in.', severity: 'success' });
        setTimeout(() => navigate('/SignIn'), 2000);
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Connection failed.', severity: 'error' });
    }
  };

  return (
    <>
      <CssBaseline />
      <SignUpContainer direction="column" justifyContent="space-between">
        <StyledCard variant="outlined">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={4} sx={{ mb: 4 }}>
            <Box sx={{ width: '60px', height: '60px' }}>
              <img src="/it_logo.png" alt="IT-PMS Logo" style={{ width: '100%', height: '100%', objectFit: 'scale-down' }} />
            </Box>
            <Typography component="h1" variant="h4" sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center' }}>
              Sign up
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['name', 'email', 'password'].map((field) => (
              <FormControl key={field}>
                <FormLabel htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                <TextField
                  id={field}
                  name={field}
                  type={field === 'password' ? 'password' : 'text'}
                  placeholder={field === 'name' ? 'Incognito user' : field === 'email' ? 'your@gmail.com' : '••••••'}
                  autoComplete={field}
                  required
                  fullWidth
                  error={!!errors[field === 'name' ? 'username' : field]}
                  helperText={errors[field === 'name' ? 'username' : field] || ''}
                />
              </FormControl>
            ))}

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

      {/* Snackbar สำหรับแจ้งเตือน */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
