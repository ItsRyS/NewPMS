import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from '../../components/ReusableSnackbar'; // ใช้ useSnackbar

const UploadDoc = () => {
  const showSnackbar = useSnackbar();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [documents, setDocuments] = useState([]);
  const [pdfPath, setPdfPath] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('Loading...');
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/document');
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        showSnackbar('Failed to fetch documents', 'error'); // ใช้ showSnackbar
      }
    };

    const fetchUsername = async () => {
      try {
        const response = await api.get('/auth/check-session');
        if (response.data.isAuthenticated) {
          setUsername(response.data.user.user_id);
        }
      } catch (error) {
        console.error('Failed to fetch session info:', error);
      }
    };

    fetchUsername();
    fetchDocuments();
  }, [searchParams, showSnackbar]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type !== 'application/pdf') {
      showSnackbar('Please upload only PDF files.', 'error');
      setFile(null);
      setFileName('');
    } else {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file || !docTitle || !docDescription) {
      showSnackbar("Please fill out all fields.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_title", docTitle.trim());
    formData.append("doc_description", docDescription.trim());
    formData.append("uploaded_by", username);

    try {
      await api.post("/document/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSnackbar("อัปโหลดสำเร็จ!", "success");

      const updatedDocuments = await api.get("/document");
      setDocuments(updatedDocuments.data);

      setFile(null);
      setFileName("");
      setDocTitle("");
      setDocDescription("");
    } catch (error) {
      console.error("Error uploading document:", error);
      showSnackbar("Failed to upload document.", "error");
    }
  };

  const handleViewDocument = (docPath) => {
    if (!docPath) {
      showSnackbar('Document not found.', 'error');
      return;
    }
    setLoading(true);
    setPdfPath(docPath);
    setOpenDialog(true);
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?'))
      return;

    try {
      await api.delete(`/document/${docId}`);
      showSnackbar('Document deleted successfully.', 'success');
      setDocuments((prev) => prev.filter((doc) => doc.doc_id !== docId));
    } catch (error) {
      console.error('Error deleting document:', error);
      showSnackbar('Failed to delete document.', 'error');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>

              เพิ่มเอกสารแบบฟอร์ม
            </Typography>
            <TextField
              label="Document Title"
              variant="outlined"
              fullWidth
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Document Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={docDescription}
              onChange={(e) => setDocDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button
                variant="contained"
                component="label"
                sx={{ mr: 2 }}
              >
                เลือกไฟล์ PDF
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {fileName && (
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Selected File: {fileName}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
              >
                ยืนยัน
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            ประวัติการอัปโหลดเอกสาร
          </Typography>
          {documents.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              ไม่มีเอกสาร
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
              {documents.map((doc) => (
                <Paper
                  key={doc.doc_id}
                  elevation={2}
                  sx={{
                    padding: 2,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': { backgroundColor: '#f1f1f1' },
                  }}
                >
                  <Box>
                    <Typography variant="h6">{doc.doc_title}</Typography>
                    <Typography variant="body2">
                      {doc.doc_description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      เพิ่มโดย: {doc.uploaded_by} |{' '}
                      {new Date(doc.upload_date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewDocument(doc.doc_path)}
                      sx={{ mr: 2 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteDocument(doc.doc_id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullScreen={fullScreen}
        maxWidth="lg"
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
          {loading && <CircularProgress />}
          {pdfPath ? (
            <iframe
              src={pdfPath}
              width="100%"
              height="100%"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                showSnackbar(
                  'Failed to load PDF document. Please try again.',
                  'error'
                );
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

export default UploadDoc;