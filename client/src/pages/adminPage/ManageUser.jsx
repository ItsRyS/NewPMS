import { useEffect, useState } from 'react';
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import {
  Button,
  Container,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import api from '../../services/api'; // axios instance
import EditIcon from '@mui/icons-material/Edit';


const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.email) newErrors.email = 'Email is required';
    return newErrors;
  };

  const handleOpen = (user = null) => {
    setEditUser(user);
    setForm(user ? { ...user, password: '' } : { username: '', email: '', password: '', role: '' });
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (editUser) {
        await api.put(`/users/${editUser.user_id}`, form);
      } else {
        await api.post('/users', form);
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      console.error('Failed to save user', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== id));
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const columns = [
    { field: 'user_id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key={`edit-${params.id}`}
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpen(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key={`delete-${params.id}`}
          icon={<DeleteForeverIcon />}
          label="Delete"
          onClick={() => deleteUser(params.id)}
          showInMenu={false}
        />
      ],
    },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add User
      </Button>
      <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.user_id}
          loading={loading}
          disableSelectionOnClick
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
          />
          {!editUser && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          <TextField
            margin="dense"
            label="Role"
            fullWidth
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageUser;
