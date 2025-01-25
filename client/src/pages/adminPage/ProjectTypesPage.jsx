import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';

const ProjectTypesPage = () => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProjectType, setCurrentProjectType] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const fetchProjectTypes = async () => {
    try {
      const response = await api.get('/project-types');
      setProjectTypes(response.data.data);
    } catch (error) {
      console.error('Error fetching project types:', error);
      showSnackbar('Failed to fetch project types', 'error');
    }
  };

  const handleOpenDialog = (projectType = {}) => {
    setCurrentProjectType(projectType);
    setIsEditing(!!projectType.project_type_id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProjectType({});
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await api.put(`/project-types/${currentProjectType.project_type_id}`, currentProjectType);
        showSnackbar('Project type updated successfully', 'success');
      } else {
        await api.post('/project-types', currentProjectType);
        showSnackbar('Project type created successfully', 'success');
      }
      fetchProjectTypes();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving project type:', error);
      showSnackbar('Failed to save project type', 'error');
    }
  };

  const handleDelete = async (projectTypeId) => {
    try {
      await api.delete(`/project-types/${projectTypeId}`);
      showSnackbar('Project type deleted successfully', 'success');
      fetchProjectTypes();
    } catch (error) {
      console.error('Error deleting project type:', error);
      showSnackbar('Failed to delete project type', 'error');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Project Types
      </Typography>
      <Button variant="contained" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Add New Project Type
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectTypes.map((type) => (
              <TableRow key={type.project_type_id}>
                <TableCell>{type.project_type_id}</TableCell>
                <TableCell>{type.project_type_name}</TableCell>
                <TableCell>{type.project_type_description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(type)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(type.project_type_id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edit Project Type' : 'Add New Project Type'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Project Type Name"
            fullWidth
            value={currentProjectType.project_type_name || ''}
            onChange={(e) =>
              setCurrentProjectType({ ...currentProjectType, project_type_name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            value={currentProjectType.project_type_description || ''}
            onChange={(e) =>
              setCurrentProjectType({ ...currentProjectType, project_type_description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTypesPage;