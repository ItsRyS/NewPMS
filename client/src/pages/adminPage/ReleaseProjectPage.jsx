import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,

  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';
const ReleaseProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const showSnackbar = useSnackbar();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/project-release/pending');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showSnackbar('Failed to fetch projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);





  const handleReleaseProject = async (projectId) => {
    try {
      await api.put(`/project-release/update-status/${projectId}`);
      showSnackbar('Project released successfully.', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Error releasing project:', error);
      showSnackbar('Failed to release project.', 'error');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
      <Typography variant="h4" gutterBottom>
        Release Projects
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name (TH)</TableCell>
              <TableCell>Project Name (EN)</TableCell>
              <TableCell>Project Type</TableCell>
              <TableCell>Advisor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.project_id}>
                <TableCell>{project.project_name_th}</TableCell>
                <TableCell>{project.project_name_eng}</TableCell>
                <TableCell>{project.project_type}</TableCell>
                <TableCell>{project.advisor_name}</TableCell>
                <TableCell>{project.project_status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleReleaseProject(project.project_id)}
                  >
                    Release
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </Paper>
  );
};

export default ReleaseProjectPage;
