import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '../../components/ReusableSnackbar';
import api from '../../services/api';

const Documentation = () => {
  const [documents, setDocuments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [pdfPath, setPdfPath] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const showSnackbar = useSnackbar();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/document');
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        showSnackbar('Failed to fetch documents', 'error');
      }
    };
    fetchDocuments();
  }, []);

  const handleViewDocument = (docPath) => {
    if (!docPath) {
      showSnackbar('Document not found.', 'error');
      return;
    }
    setLoading(true);
    const normalizedPath = docPath.replace(/\\/g, '/');
    const fullPath = `http://localhost:5000/${normalizedPath}`;
    setPdfPath(fullPath);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPdfPath('');
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
      <Typography variant="h4" gutterBottom>
        Documentation
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.doc_id}>
                <TableCell>{doc.doc_title}</TableCell>
                <TableCell>{doc.doc_description}</TableCell>
                <TableCell>{doc.uploaded_by}</TableCell>
                <TableCell>
                  {new Date(doc.upload_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewDocument(doc.doc_path)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullScreen={fullScreen}
        maxWidth="lg"
        sx={{
          '& .MuiDialog-paper': { width: '90%', height: '90%' },
        }}
      >
        <IconButton
          onClick={handleCloseDialog}
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
          {loading && <CircularProgress />}
          {pdfPath ? (
            <iframe
              src={pdfPath}
              width="100%"
              height="100%"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                showSnackbar('Failed to load PDF document. Please try again.', 'error');
              }}
              style={{
                border: 'none',
                display: loading ? 'none' : 'block',
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
    </Paper>
  );
};

export default Documentation;