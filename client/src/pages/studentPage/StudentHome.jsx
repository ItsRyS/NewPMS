import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import ProjectTable from '../../components/ProjectTable';
import api from '../../services/api';
import { fetchProjectsData } from '../../services/projectUtils';

function StudentHome() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const tabId = sessionStorage.getItem('tabId');
        const response = await api.get('/auth/check-session', {
          headers: { 'x-tab-id': tabId },
        });
        if (!response.data.isAuthenticated) {
          navigate('/SignIn');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        navigate('/SignIn');
      }
    };

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await fetchProjectsData();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };


    checkSession();
    fetchProjects();
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
      <Container sx={{ py: 4, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Typography variant="h4" gutterBottom>
          โครงการของนักศึกษา
        </Typography>
        <ProjectTable rows={projects} loading={loading} />
      </Container>
    </Box>
  );
}

export default StudentHome;
