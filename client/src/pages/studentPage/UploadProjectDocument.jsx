import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  List,
  ListItem,
  Grid,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import RemoveRedEyeTwoToneIcon from "@mui/icons-material/RemoveRedEyeTwoTone";
import CancelTwoToneIcon from "@mui/icons-material/CancelTwoTone";
import api from "../../services/api";

const UploadProjectDocument = () => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [file, setFile] = useState(null);
  const [approvedProject, setApprovedProject] = useState(null);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openResubmitDialog, setOpenResubmitDialog] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sessionResponse = await api.get("/auth/check-session");
      const studentId = sessionResponse.data.user.user_id;

      const [typesResponse, requestsResponse] = await Promise.all([
        api.get("/document-types/types"),
        api.get(`/project-requests/status?studentId=${studentId}`),
      ]);

      setDocumentTypes(typesResponse.data);

      const approvedRequest = requestsResponse.data.data.find(
        (request) => request.status === "approved"
      );

      setApprovedProject(approvedRequest || null);

      if (approvedRequest) {
        const historyResponse = await api.get(
          `/project-documents/history?requestId=${approvedRequest.request_id}`
        );
        setDocumentHistory(historyResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handleViewDocument = (filePath) => {
    if (filePath) {
      setSelectedFilePath(`http://localhost:5000/${filePath}`);
      setOpenViewDialog(true);
    } else {
      console.error("Invalid file path:", filePath);
    }
  };

  const handleCloseViewDialog = () => {
    setSelectedFilePath("");
    setOpenViewDialog(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !selectedType || !approvedProject) {
      setSnackbar({
        open: true,
        message: "Please fill all fields.",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type_id", selectedType);
    formData.append("request_id", approvedProject.request_id);

    try {
      setLoading(true);
      await api.post("/project-documents/upload", formData);
      setSnackbar({
        open: true,
        message: "Document uploaded successfully.",
        severity: "success",
      });

      setSelectedType("");
      setFile(null);
      fetchData();
    } catch (error) {
      console.error("Error uploading document:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload document.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCancelSubmission = async () => {
    try {
      setLoading(true);
      await api.delete(`/project-documents/delete/${currentDocumentId}`);
      setSnackbar({
        open: true,
        message: "Document submission canceled successfully.",
        severity: "success",
      });
      fetchData();
      handleCloseCancelDialog();
    } catch (error) {
      console.error("Error canceling submission:", error);
      setSnackbar({
        open: true,
        message: "Failed to cancel document submission.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleResubmit = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: "Please select a file to resubmit.",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post(
        `/project-documents/resubmit/${currentDocumentId}`,
        formData
      );
      setSnackbar({
        open: true,
        message: "Document resubmitted successfully.",
        severity: "success",
      });
      fetchData();
      handleCloseResubmitDialog();
    } catch (error) {
      console.error("Error resubmitting document:", error);
      setSnackbar({
        open: true,
        message: "Failed to resubmit document.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResubmitDialog = (documentId) => {
    setCurrentDocumentId(documentId);
    setOpenResubmitDialog(true);
  };

  const handleCloseResubmitDialog = () => {
    setFile(null);
    setOpenResubmitDialog(false);
  };
  const handleOpenCancelDialog = (documentId) => {
    setCurrentDocumentId(documentId);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };
  return (
    <Box sx={{ p: 2, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Upload Project Document
      </Typography>

      <Grid container spacing={4}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload Document
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Document Type"
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" component="label">
                Choose File
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Upload Document"}
            </Button>
          </Paper>
        </Grid>

        {/* Submission History */}

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                textAlign: "center",
                borderBottom: "2px solid #ddd",
                pb: 1,
                mb: 2,
              }}
            >
              Submission History
            </Typography>
            <List sx={{ maxHeight: "60vh", overflowY: "auto" }}>
              {documentHistory.map((doc) => (
                <ListItem
                  key={doc.document_id}
                  divider
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {/* Left Content */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {doc.type_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Submitted at:{" "}
                      {new Date(doc.submitted_at).toLocaleString()}
                    </Typography>
                    {doc.status === "rejected" && (
                      <Typography variant="body2" color="error">
                        Reason: {doc.reject_reason}
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      onClick={() => {
                        if (doc.file_path) {
                          handleViewDocument(doc.file_path);
                        } else {
                          console.error("File path is undefined");
                        }
                      }}
                      sx={{ minWidth: "auto", p: 0 }}
                      color="inherit"
                    >
                      <RemoveRedEyeTwoToneIcon />
                    </Button>

                    {doc.status === "pending" && (
                      <Button
                        color="error"
                        sx={{ minWidth: "auto", p: 0 }}
                        onClick={() => handleOpenCancelDialog(doc.document_id)}
                      >
                        <CancelTwoToneIcon />
                      </Button>
                    )}

                    {doc.status === "rejected" && (
                      <Button
                        color="warning"
                        sx={{ minWidth: "auto", p: 0, fontWeight: "bold" }}
                        onClick={() =>
                          handleOpenResubmitDialog(doc.document_id, doc.type_id)
                        }
                      >
                        Resubmit
                      </Button>
                    )}
                  </Box>

                  {/* Status Chip */}
                  <Chip
                    label={
                      doc.status.charAt(0).toUpperCase() + doc.status.slice(1)
                    }
                    color={
                      doc.status === "approved"
                        ? "success"
                        : doc.status === "rejected"
                        ? "error"
                        : "default"
                    }
                    sx={{ mt: { xs: 1, md: 0 } }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openResubmitDialog} onClose={handleCloseResubmitDialog}>
        <DialogTitle>Resubmit Document</DialogTitle>
        <DialogContent>
          <Button variant="contained" component="label">
            Choose File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography>{file.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResubmitDialog} color="error">
            Cancel
          </Button>
          <Button onClick={handleResubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {/* Cancel Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Confirm Cancel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this document submission? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            No
          </Button>
          <Button onClick={handleCancelSubmission} color="error">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>View Document</DialogTitle>
        <DialogContent>
          {selectedFilePath ? (
            <iframe
              src={selectedFilePath}
              width="100%"
              height="500px"
              title="Document Viewer"
              style={{ border: "none" }}
            />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Document not available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} color="error">
            Close
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

export default UploadProjectDocument;
