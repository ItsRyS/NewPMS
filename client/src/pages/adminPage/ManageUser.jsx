import { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/system';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';
const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [searchField, setSearchField] = useState('username');
  const [searchQuery, setSearchQuery] = useState('');
  const [editUser, setEditUser] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();
  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, [searchParams]);

  // Filter Users
  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user[searchField]
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [users, searchField, searchQuery]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.email) newErrors.email = 'Email is required';
    return newErrors;
  };

  const handleOpenDialog = (user = null) => {
    setEditUser(user);
    setForm(
      user
        ? { ...user, password: '' }
        : { username: '', email: '', password: '', role: '' }
    );
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    try {
      if (editUser) {
        await api.put(`/users/${editUser.user_id}`, form);
      } else {
        await api.post('/users', form);
      }
      setOpenDialog(false);
      setUsers(await api.get('/users').then((res) => res.data));
    } catch (error) {
      console.error('Failed to save user', error);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user.user_id !== id));
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const columns = [
    { field: 'user_id', headerName: 'ID', flex: 0.2 },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 0.5 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteForeverIcon />}
          label="Delete"
          onClick={() => deleteUser(params.id)}
        />,
      ],
    },
  ];

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant={isMobile ? 'h6' : 'h5'}>Manage Users</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add User
        </Button>
      </Box>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={2}
        mb={2}
      >
        <FormControl fullWidth>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <MenuItem value="username">Username</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="role">Role</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label={`Search by ${searchField}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          autoHeight
          getRowId={(row) => row.user_id}
        />
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ManageUser;
