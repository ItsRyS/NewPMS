import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  TextField,
  MenuItem,
} from '@mui/material';
import NavbarHome from '../../components/NavHome';
import FooterHome from '../../components/FooterHome';
import ProjectTable from '../../components/ProjectTable'; // Import Component
import dayjs from 'dayjs';
import api from '../../services/api';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('project_name_th');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/projects');
        const formattedProjects = response.data.data.map((project) => ({
          ...project,
          project_create_time: dayjs(project.project_create_time).format('DD/MM/YYYY'),
        }));
        setProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          {params.row.team_members
            ? params.row.team_members.split(', ').map((member, index) => (
                <span key={index}>{member}</span>
              ))
            : 'ไม่มีสมาชิก'}
        </Box>
      ),
    },
    {
      field: 'project_advisor',
      headerName: 'ที่ปรึกษา',
      flex: 1,
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

  const filteredProjects = projects.filter((project) =>
    project[searchField]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <NavbarHome />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Container sx={{ py: 4, marginTop: '70px', flex: 1 }}>
          {/* Search Section */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="ค้นหาตาม"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* ใช้ ProjectTable Component */}
          <ProjectTable rows={filteredProjects} columns={columns} loading={loading} />
        </Container>
        <FooterHome />
      </Box>
    </>
  );
};

export default Home;
