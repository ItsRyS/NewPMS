import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import api from '../../services/api';

const ProfileUser = () => {
  const [user, setUser] = useState({
    id: '', // Ensure id is included in the state
    username: '',
    email: '',
    role: '', // Ensure role is included
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/me'); // Fetch current user data
        const { id, username, email, role } = response.data; // Include role in the response
        setUser({ id, username, email, role, password: '', confirmPassword: '' }); // Set role in the state
      } catch {
        setError('Failed to fetch user data');
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

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
        role: user.role, // Ensure role is included in the payload
        ...(user.password && { password: user.password }), // Only include password if it's provided
      };

      const response = await api.put(`/users/${user.id}`, payload); // Use user.id in the URL
      if (response.status === 200) {
        setSuccess('Profile updated successfully');
        setTimeout(() => navigate('/SignIn'), 1000); // Redirect after success
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
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="password"
            type="password"
            value={user.password}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={user.confirmPassword}
            onChange={handleChange}
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