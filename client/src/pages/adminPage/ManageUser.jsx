import { useEffect, useState, useCallback } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Button,
  Container,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../services/api"; // axios instance

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [searchField, setSearchField] = useState("username");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const filterUsers = useCallback(() => {
    const filtered = users.filter((user) =>
      user[searchField]
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchField, searchQuery]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const validateForm = () => {
    let newErrors = {};
    if (!form.username) newErrors.username = "Username is required";
    if (!form.email) newErrors.email = "Email is required";
    return newErrors;
  };

  const handleOpen = (user = null) => {
    setEditUser(user);
    setForm(
      user
        ? { ...user, password: "" }
        : { username: "", email: "", password: "", role: "" }
    );
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
        await api.post("/users", form);
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      console.error("Failed to save user", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== id));
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const columns = [
    { field: "user_id", headerName: "ID", flex: 0.2 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 0.4 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      renderHeader: () => <Typography variant="body2">Actions</Typography>,
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
        />,
      ],
    },
  ];

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh",
        mt: 0,
        padding: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          padding: "20px",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Manage Users
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleOpen()}
          >
            Add User
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 150 } }}
          >
            <InputLabel>Search By</InputLabel>
            <Select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              label="Search By"
            >
              <MenuItem value="username">Username</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="role">Role</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={`Search by ${searchField}`}
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </Box>

        <Box
          sx={{
            height: 400,
            width: "100%",
          }}
        >
          <DataGrid
            autoWidth
            rows={filteredUsers}
            columns={columns}
            getRowId={(row) => row.user_id}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle>
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
  <TextField
    margin="dense"
    label="Password"
    type="password"
    fullWidth
    value={form.password}
    onChange={(e) => setForm({ ...form, password: e.target.value })}
  />
  
  {/* เปลี่ยนจาก TextField เป็น Select สำหรับ Role */}
  <FormControl fullWidth margin="dense">
    <InputLabel>Role</InputLabel>
    <Select
      value={form.role}
      onChange={(e) => setForm({ ...form, role: e.target.value })}
      label="Role"
    >
      <MenuItem value="admin">Admin</MenuItem>
      <MenuItem value="student">Student</MenuItem>
    </Select>
  </FormControl>
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
