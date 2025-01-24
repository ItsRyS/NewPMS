import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Avatar,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Icons for show/hide password
import api from '../../services/api';

const ProfileUser = () => {
  const [user, setUser] = useState({
    id: '',
    username: '',
    email: '',
    role: '', // Role is fetched but cannot be changed
    password: '',
    confirmPassword: '',
    profileImage: '', // For profile picture
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For toggling confirm password visibility
  const navigate = useNavigate();

  // Fetch current user data
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
        setError('Failed to fetch user data');
      }
    };
    fetchUserData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handle profile picture upload
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
      setSuccess('Profile picture updated successfully');
    } catch {
      setError('Failed to upload profile picture');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password match
    if (user.password && user.password !== user.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const payload = {
        username: user.username,
        email: user.email,
        ...(user.password && { password: user.password }), // Only include password if it's provided
      };

      const response = await api.put(`/users/${user.id}`, payload); // Update user data
      if (response.status === 200) {
        setSuccess('Profile updated successfully');
        setTimeout(() => navigate('/dashboard'), 2000); // Redirect after success
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Profile
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* Profile Picture Upload */}
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
          {/* Username Field */}
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
          />

          {/* Email Field */}
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

          {/* Role Field (Disabled) */}
          <TextField
            fullWidth
            margin="normal"
            label="Role"
            name="role"
            value={user.role}
            disabled // Disable the role field
          />

          {/* Password Field with Toggle */}
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

          {/* Confirm Password Field with Toggle */}
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
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Save Changes Button */}
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
