import  { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, CloudUpload } from '@mui/icons-material';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';

const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      showSnackbar('Failed to fetch students', 'error');
    }
  };

  const handleOpenDialog = (student = {}) => {
    setCurrentStudent(student);
    setIsEditing(!!student.student_id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentStudent({});
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await api.put(`/students/${currentStudent.student_id}`, currentStudent);
        showSnackbar('Student updated successfully', 'success');
      } else {
        await api.post('/students', currentStudent);
        showSnackbar('Student created successfully', 'success');
      }
      fetchStudents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving student:', error);
      showSnackbar('Failed to save student', 'error');
    }
  };

  const handleDelete = async (studentId) => {
    try {
      await api.delete(`/students/${studentId}`);
      showSnackbar('Student deleted successfully', 'success');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      showSnackbar('Failed to delete student', 'error');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      showSnackbar('กรุณาเลือกไฟล์', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await api.post('/students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // ตั้งค่า Content-Type สำหรับการอัพโหลดไฟล์
        },
      });

      if (response.data.success) {
        showSnackbar('นำเข้าข้อมูลนักศึกษาสำเร็จ', 'success');
        fetchStudents();
        setFile(null);
      } else {
        showSnackbar('เกิดข้อผิดพลาดในการนำเข้าข้อมูล', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('เกิดข้อผิดพลาดในการอัพโหลดไฟล์', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        จัดการรายชื่อนักศึกษา
      </Typography>

      {/* ส่วนอัพโหลดไฟล์ Excel */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          อัพโหลดรายชื่อนักศึกษา
        </Typography>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          style={{ marginBottom: 16 }}
        />
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'อัพโหลด'}
        </Button>
      </Box>

      {/* ส่วนเพิ่มรายชื่อนักศึกษาด้วยมือ */}
      <Button variant="contained" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        เพิ่มรายชื่อนักศึกษา
      </Button>

      {/* ตารางแสดงรายชื่อนักศึกษา */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>ชื่อ</TableCell>
              <TableCell>รหัสนักศึกษา</TableCell>
              <TableCell>อีเมล</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.student_id}>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.student_name}</TableCell>
                <TableCell>{student.student_code}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(student)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(student.student_id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog สำหรับเพิ่ม/แก้ไขรายชื่อนักศึกษา */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'แก้ไขรายชื่อนักศึกษา' : 'เพิ่มรายชื่อนักศึกษา'}</DialogTitle>
        <DialogContent>
          <TextField
            label="ชื่อ"
            fullWidth
            value={currentStudent.student_name || ''}
            onChange={(e) =>
              setCurrentStudent({ ...currentStudent, student_name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="รหัสนักศึกษา"
            fullWidth
            value={currentStudent.student_code || ''}
            onChange={(e) =>
              setCurrentStudent({ ...currentStudent, student_code: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="อีเมล"
            fullWidth
            value={currentStudent.email || ''}
            onChange={(e) =>
              setCurrentStudent({ ...currentStudent, email: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'อัปเดต' : 'สร้าง'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageStudentsPage;