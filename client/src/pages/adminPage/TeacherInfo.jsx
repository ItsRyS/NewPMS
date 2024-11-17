import { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import api from '../../services/api'; // Axios instance

const TeacherInfo = () => {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    teacher_name: '', teacher_phone: '', teacher_email: '',
    teacher_bio: '', teacher_expert: '', teacher_image: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teacher');
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/teacher/${id}`);
      fetchTeachers();
    } catch (error) {
      console.error('Failed to delete teacher:', error);
    }
  };

  const handleEdit = (teacher) => {
    setForm(teacher);
    setIsEdit(true);
    setEditId(teacher.teacher_id);
    setOpenForm(true);
  };

  const handleView = (teacher) => {
    setViewTeacher(teacher);
  };

  const handleCloseView = () => {
    setViewTeacher(null);
  };

  const handleOpenForm = () => {
    setForm({
      teacher_name: '', teacher_phone: '', teacher_email: '',
      teacher_bio: '', teacher_expert: '', teacher_image: ''
    });
    setIsEdit(false);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setIsEdit(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/teacher/${editId}`, form);
      } else {
        await api.post('/teacher', form);
      }
      fetchTeachers();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to submit form:', error.response?.data || error);
    }
  };

  return (
    <div>
      <h1>Teacher Info</h1>
      <Button variant="contained" color="primary" onClick={handleOpenForm}>
        Add New Teacher
      </Button>

      {viewTeacher && (
        <Dialog open={!!viewTeacher} onClose={handleCloseView}>
          <DialogTitle>Teacher Details</DialogTitle>
          <DialogContent>
            <p><strong>Name:</strong> {viewTeacher.teacher_name}</p>
            <p><strong>Phone:</strong> {viewTeacher.teacher_phone}</p>
            <p><strong>Email:</strong> {viewTeacher.teacher_email}</p>
            <p><strong>Bio:</strong> {viewTeacher.teacher_bio}</p>
            <p><strong>Expertise:</strong> {viewTeacher.teacher_expert}</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={form.teacher_name}
              onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={form.teacher_phone}
              onChange={(e) => setForm({ ...form, teacher_phone: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={form.teacher_email}
              onChange={(e) => setForm({ ...form, teacher_email: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Bio"
              fullWidth
              multiline
              rows={3}
              value={form.teacher_bio}
              onChange={(e) => setForm({ ...form, teacher_bio: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Expertise"
              fullWidth
              value={form.teacher_expert}
              onChange={(e) => setForm({ ...form, teacher_expert: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Image URL"
              fullWidth
              value={form.teacher_image}
              onChange={(e) => setForm({ ...form, teacher_image: e.target.value })}
            />
            <DialogActions>
              <Button onClick={handleCloseForm} color="secondary">Cancel</Button>
              <Button type="submit" color="primary">{isEdit ? 'Update' : 'Create'}</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Expertise</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.teacher_id}>
                <TableCell>{teacher.teacher_id}</TableCell>
                <TableCell>{teacher.teacher_name}</TableCell>
                <TableCell>{teacher.teacher_phone}</TableCell>
                <TableCell>{teacher.teacher_email}</TableCell>
                <TableCell>{teacher.teacher_expert}</TableCell>
                <TableCell>
                  <Button onClick={() => handleView(teacher)} color="primary">View</Button>
                  <Button onClick={() => handleEdit(teacher)} color="warning">Edit</Button>
                  <Button onClick={() => handleDelete(teacher.teacher_id)} color="error">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TeacherInfo;
