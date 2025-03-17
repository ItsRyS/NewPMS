import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Avatar,
  Tooltip,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, CameraAlt } from '@mui/icons-material';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';

const ProfileUser = () => {
  const { updateUserData } = useOutletContext();
  const [initialUser, setInitialUser] = useState(null);
  const [user, setUser] = useState({
    id: '',
    username: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
    profileImage: '',
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/me');
        const { id, username, email, role, profile_image } = response.data;
        const userData = {
          id,
          username,
          email,
          role,
          profileImage: profile_image || '',
          password: '',
          confirmPassword: '',
        };
        setUser(userData);
        setInitialUser(userData);
      } catch (error) {
        showSnackbar('Failed to fetch user data: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [showSnackbar]);

  const hasChanges = () => {
    if (!initialUser) return false;
    return (
      user.username !== initialUser.username ||
      user.email !== initialUser.email ||
      user.password !== '' ||
      user.confirmPassword !== ''
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      showSnackbar('File size exceeds the maximum limit of 2MB', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.post('/users/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.profileImage) {
        setUser((prevUser) => ({
          ...prevUser,
          profileImage: response.data.profileImage,
        }));

        // Update parent components
        if (updateUserData) {
          updateUserData(user.username, response.data.profileImage);
        }

        showSnackbar('Profile picture updated successfully', 'success');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar(
        'Failed to upload profile picture: ' + error.message,
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.password && user.password !== user.confirmPassword) {
      showSnackbar('Passwords do not match', 'error');
      return;
    }

    try {
      const payload = {
        username: user.username,
        email: user.email,
        role: user.role,
        ...(user.password && { password: user.password }),
      };

      const response = await api.put(`/users/${user.id}`, payload);
      if (response.status === 200) {
        if (user.username !== initialUser.username) {
          showSnackbar('Username updated successfully', 'success');
        }
        if (user.email !== initialUser.email) {
          showSnackbar('Email updated successfully', 'success');
        }
        if (user.password) {
          showSnackbar('Password changed successfully', 'success');
        }

        // Update parent components and session
        if (updateUserData) {
          updateUserData(user.username, user.profileImage);
        }

        // Reset password fields and update initial state
        setUser((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
        setInitialUser((prev) => ({
          ...prev,
          username: user.username,
          email: user.email,
        }));
      }
    } catch (error) {
      showSnackbar(
        'Failed to update profile: ' + (error.response?.data?.error || error.message),
        'error'
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Edit Profile
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Left Column - Profile Image */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <label htmlFor="profile-image-upload">
                  <Tooltip title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์" arrow>
                    <Box position="relative">
                      <Avatar
                        src={user.profileImage || '/default-avatar.png'}
                        sx={{
                          width: 200,
                          height: 200,
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 },
                        }}
                      />
                      {uploading && (
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bgcolor="rgba(0, 0, 0, 0.5)"
                          borderRadius="50%"
                        >
                          <CircularProgress color="primary" />
                        </Box>
                      )}
                      <CameraAlt
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          borderRadius: '50%',
                          padding: 1,
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Tooltip>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleProfileImageChange}
                    disabled={uploading}
                  />
                </label>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {user.username}
                </Typography>
                <Typography color="textSecondary">{user.role}</Typography>
              </Box>
            </Grid>

            {/* Right Column - Form Fields */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={user.username}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={user.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={user.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!hasChanges() || uploading}
                    fullWidth
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfileUser;