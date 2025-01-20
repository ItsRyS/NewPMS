import { useEffect, useState } from 'react';
import { useNavigate ,useSearchParams} from 'react-router-dom';
import ProjectTable from '../../components/ProjectTable'; // Import ProjectTable
import api from '../../services/api'; // Import API configuration
import {
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';

function StudentHome() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]); // State สำหรับเก็บข้อมูลโปรเจกต์
  const [searchTerm, setSearchTerm] = useState(''); // คำที่ใช้ค้นหา
  const [searchField, setSearchField] = useState('project_name_th'); // ฟิลด์ที่ต้องการค้นหา
  const [loading, setLoading] = useState(true); // State สำหรับสถานะการโหลดข้อมูล
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const checkSession = async () => {
      try {
        const tabId = sessionStorage.getItem('tabId'); // ดึง tabId จาก sessionStorage
        const response = await api.get('/auth/check-session', {
          headers: { 'x-tab-id': tabId }, // ส่ง tabId ใน Header
        });

        if (!response.data.isAuthenticated) {
          navigate('/SignIn'); // ถ้า session หมดอายุหรือไม่ถูกต้องให้ redirect
        }
      } catch (error) {
        console.error('Session check failed:', error);
        navigate('/SignIn'); // Redirect กรณีเกิดข้อผิดพลาด
      }
    };

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/projects'); // เรียก API เพื่อดึงข้อมูลโปรเจกต์
        setProjects(response.data.data); // เก็บข้อมูลโปรเจกต์ใน state
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    fetchProjects(); // ดึงข้อมูลโปรเจกต์เมื่อ component ถูก mount
  }, [searchParams,navigate]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // อัปเดตคำค้นหา
  };

  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value); // อัปเดตฟิลด์สำหรับการค้นหา
  };

  const filteredProjects = projects.filter((project) =>
    project[searchField]
      ?.toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: 'project_name_th',
      headerName: 'ชื่อโครงการ (TH)',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'project_name_eng',
      headerName: 'ชื่อโครงการ (EN)',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'team_members',
      headerName: 'สมาชิกในทีม',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div>
          {params.row.team_members
            ? params.row.team_members.split(', ').map((member, index) => (
                <Typography key={index}>{member}</Typography>
              ))
            : 'ไม่มีสมาชิก'}
        </div>
      ),
    },
    {
      field: 'project_advisor',
      headerName: 'ที่ปรึกษา',
      flex: 0.5,
      minWidth: 120,
    },
    { field: 'project_type', headerName: 'ประเภท', flex: 0.5, minWidth: 100 },
    {
      field: 'project_status',
      headerName: 'สถานะ',
      flex: 0.3,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'project_create_time',
      headerName: 'วันที่สร้าง',
      flex: 0.3,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
      <Container sx={{ py: 4, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Typography variant="h4" gutterBottom>
          โครงการของนักศึกษา
        </Typography>

        {/* Search Section */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="ค้นหาตาม"
              value={searchField}
              onChange={handleSearchFieldChange}
              fullWidth
            >
              <MenuItem value="project_name_th">ชื่อโครงการ (TH)</MenuItem>
              <MenuItem value="project_name_eng">ชื่อโครงการ (EN)</MenuItem>
              <MenuItem value="project_advisor">ที่ปรึกษา</MenuItem>
              <MenuItem value="team_members">สมาชิกในทีม</MenuItem>
              <MenuItem value="project_type">ประเภท</MenuItem>
              <MenuItem value="project_status">สถานะ</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              placeholder="ค้นหาข้อมูล"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* ใช้ ProjectTable Component */}
        <ProjectTable rows={filteredProjects} columns={columns} loading={loading} />
      </Container>
    </Box>
  );
}

export default StudentHome;
