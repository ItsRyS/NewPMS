import { useState, useEffect } from 'react';
import { Box, Button, Checkbox, CssBaseline, FormControlLabel, FormLabel, FormControl, TextField, Typography, Stack, Card, Link, Snackbar, Alert } from '@mui/material';
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

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
}));

export default function SignIn() {
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('tabId')) {
      sessionStorage.setItem('tabId', `${Date.now()}-${Math.random()}`);
    }
  }, []);

  const validateInputs = ({ email, password }) => {
    const newErrors = {
      email: !/\S+@\S+\.\S+/.test(email) ? 'Please enter a valid email address.' : '',
      password: password.length < 6 ? 'Password must be at least 6 characters long.' : '',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(event.currentTarget).entries());
    const tabId = sessionStorage.getItem('tabId');

    if (!validateInputs({ email, password })) return;

    try {
      const response = await api.post('/auth/login', { email, password, tabId }, { withCredentials: true });
      const { role } = response.data;

      setSnackbar({ open: true, message: 'Sign in successful!', severity: 'success' });
      setTimeout(() => navigate(role === 'teacher' ? '/adminHome' : '/studentHome'), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Sign-in failed. Please check your credentials.', severity: 'error' });
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

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['email', 'password'].map((field) => (
              <FormControl key={field}>
                <FormLabel htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                <TextField
                  id={field}
                  name={field}
                  type={field === 'password' ? 'password' : 'email'}
                  placeholder={field === 'email' ? 'your@email.com' : '••••••'}
                  autoComplete={field}
                  required
                  fullWidth
                  error={!!errors[field]}
                  helperText={errors[field] || ''}
                />
              </FormControl>
            ))}

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

      {/* Snackbar สำหรับแจ้งเตือน */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
