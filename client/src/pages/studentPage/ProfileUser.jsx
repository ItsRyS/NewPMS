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
} from '@mui/material';
import { Visibility, VisibilityOff, CameraAlt } from '@mui/icons-material';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';

const ProfileUser = () => {
  const { updateProfileImage, updateUserData } = useOutletContext();
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

    // ตรวจสอบขนาดไฟล์ (ตัวอย่างกำหนดขนาดสูงสุดเป็น 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      showSnackbar('File size exceeds the maximum limit of 2MB', 'error');
      return;
    }

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

      // อัปเดตรูปโปรไฟล์ใน SideStudent
      if (updateProfileImage) {
        updateProfileImage(response.data.profileImage);
      }
      if (updateUserData) {
        updateUserData(user.username, response.data.profileImage);
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
        role: user.role,
        ...(user.password && { password: user.password }),
      };

      const response = await api.put(`/users/${user.id}`, payload);
      if (response.status === 200) {
        showSnackbar('Profile updated successfully', 'success');

        // อัปเดตข้อมูลผู้ใช้ใน SideStudent
        if (updateUserData) {
          updateUserData(user.username, user.profileImage);
        }

        // อัปเดตเซสชัน
        const tabId = sessionStorage.getItem('tabId');
        if (tabId) {
          await api.post('/auth/update-session', {
            tabId,
            username: user.username,
            profileImage: user.profileImage,
          });
        }


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
        <Typography variant="h4" gutterBottom align='center'>
          Edit Profile
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <label htmlFor="profile-image-upload">
            <Tooltip title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์" arrow>
              <Avatar
                src={
                  user.profileImage
                    ? `http://localhost:5000/${user.profileImage}`
                    : 'https://i.pravatar.cc/300'
                }
                sx={{
                  width: 100,
                  height: 100,
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
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
              </Avatar>
            </Tooltip>
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
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
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