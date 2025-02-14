import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Grid,
  Modal,
  Button,
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import api from '../../services/api';
import NavbarHome from '../../components/NavHome';
import FooterHome from '../../components/FooterHome';

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicFilter, setAcademicFilter] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState(''); // New state for expertise filter
  const [academicOptions, setAcademicOptions] = useState([]);
  const [expertiseOptions, setExpertiseOptions] = useState([]); // New state for expertise options

  const placeholderImage = 'https://via.placeholder.com/140x100?text=No+Image';

  const handleOpen = (teacher) => {
    setSelectedTeacher(teacher);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTeacher(null);
  };

  useEffect(() => {
    api
      .get('/teacher')
      .then((response) => {
        setTeachers(response.data);
        setFilteredTeachers(response.data);

        // Extract unique academic and expertise options
        const uniqueAcademic = [
          ...new Set(response.data.map((teacher) => teacher.teacher_academic)),
        ];
        const uniqueExpertise = [
          ...new Set(response.data.map((teacher) => teacher.teacher_expert)),
        ];

        setAcademicOptions(uniqueAcademic);
        setExpertiseOptions(uniqueExpertise);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      });
  }, []);

  useEffect(() => {
    // Combined filter for name, academic position, and expertise
    const filtered = teachers.filter((teacher) => {
      const matchesName = teacher.teacher_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesAcademic =
        academicFilter === '' || teacher.teacher_academic === academicFilter;
      const matchesExpertise =
        expertiseFilter === '' || teacher.teacher_expert === expertiseFilter;

      return matchesName && matchesAcademic && matchesExpertise;
    });
    setFilteredTeachers(filtered);
  }, [searchTerm, academicFilter, expertiseFilter, teachers]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavbarHome />
      <Box sx={{ flex: 1, paddingBottom: '64px' }}>
        <Container
          className="content-teacher"
          maxWidth="lg"
          sx={{
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBlock: '90px',
            justifyContent: 'center',
            boxShadow: 10,
            borderRadius: '12px',
            padding: 0,
          }}
        >
          <Box sx={{ width: '100%', padding: 2 }}>
            {error && (
              <Typography variant="body1" color="error" sx={{ mb: 3 }}>
                {error}
              </Typography>
            )}

            {/* Search and Filters Row */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="ค้นหาชื่ออาจารย์"
                  variant="outlined"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>ค้นหาตามตำแหน่ง</InputLabel>
                  <Select
                    value={academicFilter}
                    onChange={(e) => setAcademicFilter(e.target.value)}
                  >
                    <MenuItem value="">แสดงทั้งหมด</MenuItem>
                    {academicOptions.map((academic, index) => (
                      <MenuItem key={index} value={academic}>
                        {academic}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>ค้นหาตามความชำนาญ</InputLabel>
                  <Select
                    value={expertiseFilter}
                    onChange={(e) => setExpertiseFilter(e.target.value)}
                  >
                    <MenuItem value="">แสดงทั้งหมด</MenuItem>
                    {expertiseOptions.map((expertise, index) => (
                      <MenuItem key={index} value={expertise}>
                        {expertise}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Teacher Cards */}
            <Grid container spacing={3}>
              {filteredTeachers.map((teacher) => (
                <Grid item xs={12} sm={6} md={4} key={teacher.teacher_id}>
                  <Card
                    onClick={() => handleOpen(teacher)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        height: 300,
                        width: 'auto',
                        objectFit: 'contain',
                        margin: 'auto',
                        padding: '10px',
                      }}
                      image={
                        teacher.teacher_image
                          ? teacher.teacher_image
                          : placeholderImage
                      } // ใช้ URL จาก Supabase
                    />

                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">
                        {teacher.teacher_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ตำแหน่ง: {teacher.teacher_academic}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ความชำนาญ: {teacher.teacher_expert}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Modal for Detailed Info */}
            <Modal open={open} onClose={handleClose}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  bgcolor: 'background.paper',
                  border: '2px solid #000',
                  boxShadow: 24,
                  p: 2,
                }}
              >
                {selectedTeacher && (
                  <>
                    <CardMedia
                      component="img"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '50vh',
                        objectFit: 'contain',
                        marginBottom: '24px',
                      }}
                      image={
                        selectedTeacher.teacher_image
                          ? `http://localhost:5000/upload/pic/${selectedTeacher.teacher_image}`
                          : placeholderImage
                      }
                      alt={selectedTeacher.teacher_name || 'No Image'}
                    />
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ textAlign: 'center' }}
                    >
                      {selectedTeacher.teacher_name}
                    </Typography>
                    <Typography variant="body1">
                      <strong>เบอร์โทรศัพท์:</strong>{' '}
                      {selectedTeacher.teacher_phone}
                    </Typography>
                    <Typography variant="body1">
                      <strong>อีเมล์:</strong> {selectedTeacher.teacher_email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>ความชำนาญ:</strong>{' '}
                      {selectedTeacher.teacher_expert}
                    </Typography>
                    <Typography variant="body1">
                      <strong>ตำแหน่ง:</strong>{' '}
                      {selectedTeacher.teacher_academic}
                    </Typography>
                    <Button
                      onClick={handleClose}
                      variant="contained"
                      sx={{ mt: 2 }}
                    >
                      ปิด
                    </Button>
                  </>
                )}
              </Box>
            </Modal>
          </Box>
        </Container>
      </Box>
      <FooterHome />
    </Box>
  );
};

export default TeacherPage;
