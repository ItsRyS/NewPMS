import { useState, useEffect } from 'react';
import {
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Box,
  Typography,
  Container,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../services/api';
import NavbarHome from '../../components/NavHome';
import FooterHome from '../../components/FooterHome';
import { useSnackbar } from '../../components/ReusableSnackbar';

const OldProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [pdfPath, setPdfPath] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/old-projects');
        console.log(' API Response:', response.data);
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDocument = (filePath) => {
    if (!filePath) {
      showSnackbar('Document not found.', 'error');
      return;
    }
    setPdfLoading(true);
    setPdfPath(filePath);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavbarHome />

      <Box sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ width: '100%', textAlign: 'center', padding: 2 }}>
            <CardContent>
              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight={200}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography variant="h6" align="center" color="error">
                  Failed to load data. Please try again later.
                </Typography>
              ) : projects.length === 0 ? (
                <Typography variant="h6" align="center" color="textSecondary">
                  No old projects found.
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#FF6700' }}>
                        <TableCell>Project Name (Thai)</TableCell>
                        <TableCell>Project Name (English)</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Year</TableCell>
                        <TableCell>View</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.old_id}>
                          <TableCell>
                            {project.old_project_name_th || '-'}
                          </TableCell>
                          <TableCell>
                            {project.old_project_name_eng || '-'}
                          </TableCell>
                          <TableCell>{project.project_type || '-'}</TableCell>
                          <TableCell>{project.document_year || '-'}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() =>
                                handleViewDocument(project.file_path)
                              }
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Box>
        </Container>
      </Box>

      {/* Dialog แสดงเอกสาร */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': { width: '90%', height: '90%' },
        }}
      >
        <IconButton
          onClick={() => setOpenDialog(false)}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {pdfLoading && <CircularProgress />}
          {pdfPath ? (
            <iframe
              src={pdfPath}
              width="100%"
              height="100%"
              onLoad={() => setPdfLoading(false)}
              onError={() => {
                setPdfLoading(false);
                showSnackbar(
                  'Failed to load PDF document. Please try again.',
                  'error'
                );
              }}
              style={{
                border: 'none',
                display: pdfLoading ? 'none' : 'block',
              }}
              title="Document Viewer"
            />
          ) : (
            <Typography variant="body1" color="textSecondary">
              No document to display.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      <FooterHome />
    </Box>
  );
};

export default OldProject;
