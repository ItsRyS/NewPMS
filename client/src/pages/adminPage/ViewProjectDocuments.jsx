import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';
const ViewProjectDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openRejectOptions, setOpenRejectOptions] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const [searchParams] = useSearchParams();
  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/project-documents/all');
      const pendingDocs = response.data.filter(
        (doc) => doc.status === 'pending'
      );
      setDocuments(pendingDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load documents.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDocuments();
  }, [searchParams]); // Added initial fetch effect



  const handleViewDocument = (filePath, fileName, documentId) => {
    setSelectedDocument({
      url: `http://localhost:5000/${filePath}`,
      name: fileName,
      document_id: documentId,
    });
  };

  const handleApprove = async () => {
    try {
      await api.post(
        `/project-documents/approve/${selectedDocument.document_id}`
      );
      setSnackbar({
        open: true,
        message: 'Document approved successfully.',
        severity: 'success',
      });
      fetchPendingDocuments();
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error approving document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to approve document.',
        severity: 'error',
      });
    }
  };
  const handleReturnDocument = async (file) => {
    if (!file) {
      setSnackbar({
        open: true,
        message: 'Please select a file to return.',
        severity: 'error',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(
        `/project-documents/return/${selectedDocument.document_id}`,
        formData
      );
      setSnackbar({
        open: true,
        message: 'Document returned successfully.',
        severity: 'success',
      });
      fetchPendingDocuments();
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error returning document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to return document.',
        severity: 'error',
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for rejection.',
        severity: 'warning',
      });
      return;
    }

    try {
      await api.post(`/project-documents/reject/${selectedDocument.document_id}`, {
        reason: rejectReason,
      });
      setSnackbar({
        open: true,
        message: 'Document rejected successfully.',
        severity: 'success',
      });
      fetchPendingDocuments();
      setSelectedDocument(null);
      setOpenRejectOptions(false);
    } catch (error) {
      console.error('Error rejecting document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject document.',
        severity: 'error',
      });
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
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, textAlign: 'center' }}
      >
        Submitted Project Documents
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          overflow: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Document Type</TableCell>
              <TableCell>Submitted By</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.document_id}>
                <TableCell>{doc.project_name}</TableCell>
                <TableCell>{doc.type_name}</TableCell>
                <TableCell>{doc.student_name}</TableCell>
                <TableCell>
                  {new Date(doc.submitted_at).toLocaleString()}
                </TableCell>
                <TableCell>{doc.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() =>
                      handleViewDocument(
                        doc.file_path,
                        doc.type_name,
                        doc.document_id
                      )
                    }
                  >
                    View Document
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedDocument && (
        <Modal
          open={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              height: 'calc(100vh - 32px)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Document Preview: {selectedDocument.name}
            </Typography>
            <iframe
              src={selectedDocument.url}
              width="100%"
              height="80%"
              title="Document Viewer"
              style={{ border: 'none' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenRejectOptions(true)}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                component="label"
                color="primary"
                sx={{ ml: 2 }}
              >
                Return Document
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleReturnDocument(e.target.files[0])}
                />
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

<Dialog
  open={openRejectOptions}
  onClose={() => setOpenRejectOptions(false)}
>
  <DialogTitle>Reject Document</DialogTitle>
  <DialogContent>
    <Typography variant="body1" sx={{ mb: 2 }}>
      Please provide a reason for rejection:
    </Typography>
    <TextField
      fullWidth
      multiline
      rows={4}
      value={rejectReason}
      onChange={(e) => setRejectReason(e.target.value)}
      placeholder="Provide a detailed reason"
      sx={{ mt: 2 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenRejectOptions(false)} color="primary">
      Cancel
    </Button>
    <Button
      onClick={handleReject}
      color="error"
      disabled={!rejectReason.trim()} // ปุ่ม Confirm จะกดไม่ได้ถ้าคอมเมนต์ยังว่าง
    >
      Confirm
    </Button>
  </DialogActions>
</Dialog>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default ViewProjectDocuments;
