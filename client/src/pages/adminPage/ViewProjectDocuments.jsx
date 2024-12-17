import { useEffect, useState } from "react";
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
  Alert
} from "@mui/material";
import api from "../../services/api";

const ViewProjectDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/project-documents/all");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setSnackbar({
        open: true,
        message: "Failed to load documents.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleViewDocument = (filePath, fileName, documentId) => {
    setSelectedDocument({
      url: `http://localhost:5000/${filePath}`,
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
        message: "Document approved successfully.",
        severity: "success",
      });
  
      // โหลดข้อมูลเอกสารใหม่
      fetchDocuments();
    } catch (error) {
      console.error("Error approving document:", error);
      setSnackbar({
        open: true,
        message: "Failed to approve document.",
        severity: "error",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for rejection.",
        severity: "warning",
      });
      return;
    }
  
    try {
      await api.post(`/project-documents/reject/${currentDocumentId}`, {
        reason: rejectReason,
      });
      setSnackbar({
        open: true,
        message: "Document rejected successfully.",
        severity: "success",
      });
  
      // ปิด Dialog และรีโหลดข้อมูล
      handleCloseRejectDialog();
      fetchDocuments();
    } catch (error) {
      console.error("Error rejecting document:", error);
      setSnackbar({
        open: true,
        message: "Failed to reject document.",
        severity: "error",
      });
    }
  };
  const handleOpenRejectDialog = (documentId) => {
    setCurrentDocumentId(documentId);
    setOpenRejectDialog(true);
  };
  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectReason("");
    setCurrentDocumentId(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Submitted Project Documents
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document ID</TableCell>
              <TableCell>Project Name</TableCell>
              <TableCell>Document Type</TableCell>
              <TableCell>Submitted By</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.document_id}>
                <TableCell>{doc.document_id}</TableCell>
                <TableCell>{doc.project_name}</TableCell>
                <TableCell>{doc.type_name}</TableCell>
                <TableCell>{doc.student_name}</TableCell>
                <TableCell>
                  {new Date(doc.submitted_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleViewDocument(doc.file_path, doc.type_name, doc.document_id)
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

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "90%",
            backgroundColor: "white",
            boxShadow: 24,
            p: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Document Preview: {selectedDocument?.name}
          </Typography>
          {selectedDocument && (
            <iframe
              src={selectedDocument.url}
              width="100%"
              height="80%"
              style={{ border: "none" }}
              title="Document Viewer"
            ></iframe>
          )}
          <Box
            textAlign="right"
            mt={2}
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleApprove(selectedDocument.document_id);
                handleCloseModal();
              }}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleOpenRejectDialog(selectedDocument.document_id);
                handleCloseModal();
              }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseModal}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this document.
          </DialogContentText>
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
            Cancel
          </Button>
          <Button onClick={handleReject} color="primary">
            Submit
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
    </Box>
  );
};

export default ViewProjectDocuments;
