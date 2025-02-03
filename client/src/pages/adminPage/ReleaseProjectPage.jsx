import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';

const ReleaseProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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

  const handleOpenDialog = (project) => {
    setSelectedProject(project);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedProject(null);
    setOpenDialog(false);
  };

  const handleReleaseProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await api.get(`/project-release/check-documents/${selectedProject.project_id}`);
      const { unapprovedDocuments } = response.data;

      if (unapprovedDocuments && unapprovedDocuments.length > 0) {
        const unapprovedNames = unapprovedDocuments.map((doc) => doc.type_name).join(', ');
        showSnackbar(`Cannot release project. Missing documents: ${unapprovedNames}`, 'error');
        handleCloseDialog();
        return;
      }

      await api.put(`/project-release/update-status/${selectedProject.project_id}`);
      showSnackbar('Project released successfully.', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Error releasing project:', error);
      showSnackbar('Failed to release project.', 'error');
    } finally {
      handleCloseDialog();
    }
  };
 if (loading) {
    return <Typography variant="h4">Loading...</Typography>;
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
                  <Button variant="contained" color="primary" onClick={() => handleOpenDialog(project)}>
                    Release
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Project Release</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to release the project {selectedProject?.project_name_th} ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleReleaseProject} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReleaseProjectPage;
