import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { useSnackbar } from '../../components/ReusableSnackbar';
import api from '../../services/api';

const AddOldProject = () => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [formData, setFormData] = useState({
    projectNameTh: '',
    projectNameEng: '',
    projectType: '',
    projectYear: '',
    file: null,
  });
  const showSnackbar = useSnackbar();

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const fetchProjectTypes = async () => {
    try {
      const response = await api.get('/project-types');
      setProjectTypes(response.data.data);
    } catch {
      showSnackbar('Failed to fetch project types', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('projectNameTh', formData.projectNameTh);
    formDataToSend.append('projectNameEng', formData.projectNameEng);
    formDataToSend.append('projectType', formData.projectType);
    formDataToSend.append('projectYear', formData.projectYear);
    formDataToSend.append('file', formData.file);

    try {
      await api.post('/project-release/old-project', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSnackbar('Old project added successfully', 'success');

      // Reset form
      setFormData({
        projectNameTh: '',
        projectNameEng: '',
        projectType: '',
        projectYear: '',
        file: null,
      });
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to add project', 'error');
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardHeader title="Add Old Project Document" />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Project Name (Thai)"
              value={formData.projectNameTh}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectNameTh: e.target.value }))}
              required
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Project Name (English)"
              value={formData.projectNameEng}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectNameEng: e.target.value }))}
              required
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              select
              fullWidth
              label="Project Type"
              value={formData.projectType}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectType: e.target.value }))}
              required
            >
              {projectTypes.map((type) => (
                <MenuItem key={type.project_type_id} value={type.project_type_name}>
                  {type.project_type_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Project Year"
              type="number"
              inputProps={{ min: 2000, max: 2100 }}
              value={formData.projectYear}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectYear: e.target.value }))}
              required
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">Project Document</Typography>
            <Button variant="contained" component="label">
              Choose File
              <input type="file" accept=".pdf" hidden onChange={handleFileChange} required />
            </Button>
            {formData.file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {formData.file.name}
              </Typography>
            )}
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Project
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddOldProject;