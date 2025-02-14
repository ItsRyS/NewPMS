import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  MenuItem,
  Box,
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
  Typography,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,

} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from '../../components/ReusableSnackbar';
import api from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';

const AddOldProject = () => {
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [file, setFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(true);
  const years = Array.from(new Array(50), (_, index) => new Date().getFullYear() - index);
  const [openYearDialog, setOpenYearDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    fetchProjectTypes();
    fetchProjects();
  }, []);

  const fetchProjectTypes = async () => {
    try {
      const response = await api.get('/project-types');
      setProjectTypes(response.data.data);
    } catch {
      showSnackbar('Failed to fetch project types', 'error');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/old-projects');
      setProjects(response.data);
    } catch {
      showSnackbar('Failed to fetch old projects', 'error');
    }
  };

  const handleOpenEditDialog = (project) => {
    setEditingProject(project);
    setEditedData({ ...project });
    setFile(null);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleOpenAddDialog = () => {
    setEditingProject(null);
    setEditedData({
      old_project_name_th: '',
      old_project_name_eng: '',
      project_type: '',
      document_year: '',
    });
    setFile(null);
    setIsEditMode(false);
    setOpenDialog(true);
  };
  const handleOpenPdfDialog = (filePath) => {
    if (!filePath) {
      showSnackbar('No document available', 'error');
      return;
    }
    setPdfLoading(true);
    setPdfUrl(filePath); // ใช้ URL จาก Supabase
    setOpenPdfDialog(true);
  };
  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleYearSelection = (year) => {
    setEditedData((prev) => ({ ...prev, document_year: year }));
    setOpenYearDialog(false);
  };
  const handleSave = async () => {
    if (
      !editedData.old_project_name_th ||
      !editedData.old_project_name_eng ||
      !editedData.project_type ||
      !editedData.document_year
    ) {
      showSnackbar('Please fill out all fields', 'error');
      return;
    }

    const formData = new FormData();
    Object.entries(editedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    if (file) {
      formData.append('file', file);
    }

    try {
      if (isEditMode) {
        await api.put(`/old-projects/${editingProject.old_id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSnackbar('Project updated successfully', 'success');
      } else {
        await api.post('/old-projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSnackbar('Project added successfully', 'success');
      }

      fetchProjects();
      setOpenDialog(false);
    } catch {
      showSnackbar('Failed to save project', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?'))
      return;
    try {
      await api.delete(`/old-projects/${id}`);
      showSnackbar('Project deleted successfully', 'success');
      fetchProjects();
    } catch {
      showSnackbar('Failed to delete project', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Card>
        <CardHeader title="Manage Old Project Documents" />
        <CardContent>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{ mb: 2 }}
          >
            Add New Project
          </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name (Thai)</TableCell>
                  <TableCell>Project Name (English)</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.old_id}>
                    <TableCell>{project.old_project_name_th}</TableCell>
                    <TableCell>{project.old_project_name_eng}</TableCell>
                    <TableCell>{project.project_type}</TableCell>
                    <TableCell>{project.document_year}</TableCell>
                    <TableCell>
                      {project.file_path ? (
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenPdfDialog(project.file_path)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No File
                        </Typography>
                      )}
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditDialog(project)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(project.old_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      {/* ✅ Dialog สำหรับดูเอกสาร PDF */}
      <Dialog
        open={openPdfDialog}
        onClose={() => setOpenPdfDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>View Document</DialogTitle>
        <DialogContent
          sx={{
            height: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {pdfLoading && <CircularProgress />}
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            onLoad={() => setPdfLoading(false)}
            style={{ display: pdfLoading ? 'none' : 'block', border: 'none' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPdfDialog(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* ✅ Dialog สำหรับเพิ่ม/แก้ไขโครงงาน */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {isEditMode ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Project Name (Thai)"
            value={editedData.old_project_name_th}
            onChange={(e) =>
              handleInputChange('old_project_name_th', e.target.value)
            }
            sx={{ my: 1 }}
            required
          />
          <TextField
            fullWidth
            label="Project Name (English)"
            value={editedData.old_project_name_eng}
            onChange={(e) =>
              handleInputChange('old_project_name_eng', e.target.value)
            }
            sx={{ my: 1 }}
            required
          />
          <TextField
            select
            fullWidth
            label="Project Type"
            value={editedData.project_type}
            onChange={(e) => handleInputChange('project_type', e.target.value)}
            sx={{ my: 1 }}
            required
          >
            {projectTypes.map((type) => (
              <MenuItem
                key={type.project_type_id}
                value={type.project_type_name}
              >
                {type.project_type_name}
              </MenuItem>
            ))}
          </TextField>
          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel>Document Year *</InputLabel>
            <Select
              value={editedData.document_year}
              onChange={(e) => handleInputChange('document_year', e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" component="label" sx={{ my: 1 }}>
            Upload File
            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
        {/* ✅ Dialog เลือกปีของเอกสาร */}
        <Dialog open={openYearDialog} onClose={() => setOpenYearDialog(false)}>
        <DialogTitle>Select Document Year</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel>Document Year</InputLabel>
            <Select
              value={editedData.document_year || ''}
              onChange={(e) => handleYearSelection(e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenYearDialog(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddOldProject;
