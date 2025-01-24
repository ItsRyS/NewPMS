import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Avatar,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar'; // Import hook

const ProfileUser = () => {
  const { updateProfileImage } = useOutletContext();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const showSnackbar = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/me');
        const { id, username, email, role, profile_image } = response.data;
        setUser({
          id,
          username,
          email,
          role,
          profileImage: profile_image,
          password: '',
          confirmPassword: '',
        });
      } catch {
        showSnackbar('Failed to fetch user data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [showSnackbar]);

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

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.post('/users/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser((prevUser) => ({
        ...prevUser,
        profileImage: response.data.profileImage,
      }));
      if (updateProfileImage) {
        updateProfileImage(response.data.profileImage); // อัปเดตรูปภาพใน SideStudent
      }

      showSnackbar('Profile picture updated successfully', 'success');
    } catch {
      showSnackbar('Failed to upload profile picture', 'error');
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
        ...(user.password && { password: user.password }),
      };

      const response = await api.put(`/users/${user.id}`, payload);
      if (response.status === 200) {
        showSnackbar('Profile updated successfully', 'success');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to update profile', 'error');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Profile
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <label htmlFor="profile-image-upload">
            <Avatar
              src={
                user.profileImage
                  ? `http://localhost:5000/${user.profileImage}`
                  : 'https://i.pravatar.cc/300'
              }
              sx={{ width: 100, height: 100, cursor: 'pointer' }}
            />
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfileImageChange}
            />
          </label>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={user.email}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Role"
            name="role"
            value={user.role}
            disabled
          />

          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={user.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={user.confirmPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default ProfileUser;