import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
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
  DialogContentText,
  TextField,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import api from '../../services/api';

const ViewProjectDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

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
  }, []);

  const handleViewDocument = (filePath, fileName, documentId) => {
    setSelectedDocument({
      url: `http://localhost:4000/${filePath}`,
      name: fileName,
      document_id: documentId,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDocument(null);
  };

  const handleApprove = async (documentId) => {
    try {
      await api.post(`/project-documents/approve/${documentId}`);
      setSnackbar({
        open: true,
        message: 'Document approved successfully.',
        severity: 'success',
      });
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to approve document.',
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
      await api.post(`/project-documents/reject/${currentDocumentId}`, {
        reason: rejectReason,
      });
      setSnackbar({
        open: true,
        message: 'Document rejected successfully.',
        severity: 'success',
      });
      handleCloseRejectDialog();
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject document.',
        severity: 'error',
      });
    }
  };

  const handleOpenRejectDialog = (documentId) => {
    setCurrentDocumentId(documentId);
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectReason('');
    setCurrentDocumentId(null);
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

  if (documents.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        ไม่มีเอกสารโครงงานที่ต้องการอนุมัติ
      </Typography>
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
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow for floating table
          borderRadius: '8px', // Rounded corners for the table
          overflow: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>Document ID</TableCell> */}
              <TableCell>ชื่อโครงงาน</TableCell>
              <TableCell>แบบเอกสารที่ส่งมา</TableCell>
              <TableCell>ส่งโดย</TableCell>
              <TableCell>วันเวลาที่ส่ง</TableCell>
              <TableCell>สถานะเอกสาร</TableCell>
              <TableCell>ตรวจเอกสาร</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.document_id}>
                {/*<TableCell>{doc.document_id}</TableCell>/*/}
                <TableCell>{doc.project_name}</TableCell>
                <TableCell>{doc.type_name}</TableCell>
                <TableCell>{doc.student_name}</TableCell>
                <TableCell>
                  {new Date(doc.submitted_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={doc.status}
                    color={
                      doc.status === 'approved'
                        ? 'success'
                        : doc.status === 'rejected'
                          ? 'error'
                          : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleViewDocument(
                        doc.file_path,
                        doc.type_name,
                        doc.document_id
                      )
                    }
                  >
                    ตรวจเอกสาร
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height: 'calc(100vh - 32px)', // ใช้ 100% ของความสูง viewport ลบระยะห่างเล็กน้อย
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            overflow: 'hidden', // ป้องกันการเลื่อนเกินขอบ
          }}
        >
          <Typography variant="h6" gutterBottom>
            Document Preview: {selectedDocument?.name}
          </Typography>
          {selectedDocument && (
            <iframe
              src={selectedDocument.url}
              width="100%"
              height="85%" // ลดพื้นที่ iframe เพื่อเหลือให้ปุ่มด้านล่าง
              style={{ border: 'none' }}
              title="Document Viewer"
            ></iframe>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="text"
              color="success"
              onClick={() => {
                handleApprove(selectedDocument.document_id);
                handleCloseModal();
              }}
            >
              อนุมัติ
            </Button>
            <Button
              variant="text"
              color="error"
              onClick={() => {
                handleOpenRejectDialog(selectedDocument.document_id);
                handleCloseModal();
              }}
            >
              ไม่อนุมัติ
            </Button>
            <Button variant="text" onClick={handleCloseModal}>
              ปิด
            </Button>
          </Box>
        </Box>
      </Modal>

      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <DialogContentText>เหตูผลที่ไม่อนุมัติเอกสาร</DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} color="error">
            ปิด
          </Button>
          <Button onClick={handleReject} color="primary">
            ส่ง
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
