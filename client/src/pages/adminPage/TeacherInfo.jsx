import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../../services/api'; // Axios instance
import { useSearchParams } from 'react-router-dom';
const TeacherInfo = () => {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    teacher_name: '',
    teacher_phone: '',
    teacher_email: '',
    teacher_academic: '',
    teacher_expert: '',
    teacher_image: null,
  });
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [searchParams] = useSearchParams();
  useEffect(() => {
    fetchTeachers();
  }, [ searchParams]);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teacher');
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setConfirmDelete(true);
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete || !teacherToDelete.teacher_id) {
      console.error('Teacher ID is undefined. Cannot delete.');
      setConfirmDelete(false);
      return;
    }

    try {
      await api.delete(`/teacher/${teacherToDelete.teacher_id}`);
      fetchTeachers();
      setConfirmDelete(false);
      setTeacherToDelete(null);
    } catch (error) {
      console.error('Failed to delete teacher:', error);
    }
  };

  const handleEdit = (teacher) => {
    setForm({
      teacher_name: teacher.teacher_name,
      teacher_phone: teacher.teacher_phone,
      teacher_email: teacher.teacher_email,
      teacher_academic: teacher.teacher_academic,
      teacher_expert: teacher.teacher_expert,
      teacher_image: teacher.teacher_image || null,
    });
    setSelectedFileName(teacher.teacher_image ? teacher.teacher_image : '');
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
      teacher_name: '',
      teacher_phone: '',
      teacher_email: '',
      teacher_academic: '',
      teacher_expert: '',
      teacher_image: null,
    });
    setSelectedFileName('');
    setIsEdit(false);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setIsEdit(false);
    setEditId(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setForm({ ...form, teacher_image: e.target.files[0] });
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('teacher_name', form.teacher_name || '');
    formData.append('teacher_phone', form.teacher_phone || '');
    formData.append('teacher_email', form.teacher_email || '');
    formData.append('teacher_academic', form.teacher_academic || '');
    formData.append('teacher_expert', form.teacher_expert || '');

    if (form.teacher_image instanceof File) {
      formData.append('teacher_image', form.teacher_image);
    } else if (isEdit && selectedFileName) {
      formData.append('teacher_image', selectedFileName);
    }

    try {
      if (isEdit) {
        await api.put(`/teacher/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/teacher', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Acdemic</TableCell>
              <TableCell>Expertise</TableCell>
              <TableCell>Image</TableCell>
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
                <TableCell>{teacher.teacher_academic}</TableCell>
                <TableCell>{teacher.teacher_expert}</TableCell>
                <TableCell>
                  {teacher.teacher_image ? (
                    <img
                      src={`http://localhost:5000/upload/pic/${teacher.teacher_image}`}
                      alt={teacher.teacher_name}
                      style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleView(teacher)} color="primary">
                    View
                  </Button>
                  <Button onClick={() => handleEdit(teacher)} color="warning">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(teacher)} color="error">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการลบอาจารย์ {teacherToDelete?.teacher_name} หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="secondary">
            ยกเลิก
          </Button>
          <Button onClick={confirmDeleteTeacher} color="error">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Teacher Dialog */}
      {viewTeacher && (
        <Dialog open={!!viewTeacher} onClose={handleCloseView}>
          <DialogTitle>Teacher Details</DialogTitle>
          <DialogContent>
            <p>
              <strong>Name:</strong> {viewTeacher.teacher_name}
            </p>
            <p>
              <strong>Phone:</strong> {viewTeacher.teacher_phone}
            </p>
            <p>
              <strong>Email:</strong> {viewTeacher.teacher_email}
            </p>
            <p>
              <strong>Acdemic:</strong> {viewTeacher.teacher_academic}
            </p>
            <p>
              <strong>Expertise:</strong> {viewTeacher.teacher_expert}
            </p>
            {viewTeacher.teacher_image && (
              <img
                src={`http://localhost:5000/upload/pic/${viewTeacher.teacher_image}`}
                alt={viewTeacher.teacher_name}
                style={{ width: 100, height: 100, objectFit: 'cover' }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={form.teacher_name}
              onChange={(e) =>
                setForm({ ...form, teacher_name: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={form.teacher_phone}
              onChange={(e) =>
                setForm({ ...form, teacher_phone: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={form.teacher_email}
              onChange={(e) =>
                setForm({ ...form, teacher_email: e.target.value })
              }
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="teacher-academic-label">Academic</InputLabel>
              <Select
                labelId="teacher-academic-label"
                value={form.teacher_academic}
                onChange={(e) =>
                  setForm({ ...form, teacher_academic: e.target.value })
                }
              >
                <MenuItem value="ครูอัตราจ้าง">ครูอัตราจ้าง</MenuItem>
                <MenuItem value="ครูผู้ช่วย">ครูผู้ช่วย</MenuItem>
                <MenuItem value="ครู">ครู</MenuItem>
                <MenuItem value="ครูชำนาญการ">ครูชำนาญการ</MenuItem>
                <MenuItem value="ครูชำนาญการพิเศษ">ครูชำนาญการพิเศษ</MenuItem>
                <MenuItem value="ครูเชี่ยวชาญ">ครูเชี่ยวชาญ</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Expertise"
              fullWidth
              value={form.teacher_expert}
              onChange={(e) =>
                setForm({ ...form, teacher_expert: e.target.value })
              }
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: '15px' }}
            />
            <p>{selectedFileName}</p>
            <DialogActions>
              <Button onClick={handleCloseForm} color="secondary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherInfo;
