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
  Grid,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import RemoveRedEyeTwoToneIcon from "@mui/icons-material/RemoveRedEyeTwoTone";
import DeleteForeverTwoToneIcon from "@mui/icons-material/DeleteForeverTwoTone";
import RefreshTwoToneIcon from "@mui/icons-material/RefreshTwoTone";
import ArrowDownwardTwoToneIcon from "@mui/icons-material/ArrowDownwardTwoTone";
import ArrowUpwardTwoToneIcon from "@mui/icons-material/ArrowUpwardTwoTone";
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
  const [sortOrder, setSortOrder] = useState("desc");
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

  const sortedDocumentHistory = [...documentHistory].sort((a, b) =>
    sortOrder === "desc"
      ? new Date(b.submitted_at) - new Date(a.submitted_at)
      : new Date(a.submitted_at) - new Date(b.submitted_at)
  );

  return (
    <Box sx={{ p: 2, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        ส่งเอกสารประกอบโครงงาน
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

            {/* แสดงข้อความตามสถานะการเลือกไฟล์ */}
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              {file ? `ไฟล์ที่เลือก: ${file.name}` : "ยังไม่ได้เลือกเอกสาร"}
            </Typography>

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
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                ประวัติการส่งเอกสาร
              </Typography>
              <Button
                onClick={() =>
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                }
                startIcon={
                  sortOrder === "desc" ? (
                    <ArrowDownwardTwoToneIcon />
                  ) : (
                    <ArrowUpwardTwoToneIcon />
                  )
                }
              >
                {sortOrder === "desc" ? "ใหม่ไปเก่า" : "เก่าไปใหม่"}
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 400, overflowY: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <strong>รายการ</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>จัดการเอกสาร</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>ผลการส่ง</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedDocumentHistory.map((doc) => (
                    <TableRow key={doc.document_id}>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {doc.type_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          วันที่ส่ง:{" "}
                          {new Date(doc.submitted_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1, // ระยะห่างระหว่างไอคอน
                          }}
                        >
                          {/* ดูเอกสาร */}
                          <Tooltip title="ดูเอกสาร">
                            <span>
                              <Button
                                onClick={() =>
                                  handleViewDocument(doc.file_path)
                                }
                                color="inherit"
                                disabled={!doc.file_path}
                                sx={{ minWidth: "auto", p: 0 }}
                              >
                                <RemoveRedEyeTwoToneIcon />
                              </Button>
                            </span>
                          </Tooltip>

                          {/* ส่งอีกครั้ง */}
                          <Tooltip title="ส่งอีกครั้ง">
                            <span>
                              <Button
                                sx={{ minWidth: "auto", p: 0 }}
                                onClick={() =>
                                  handleOpenResubmitDialog(doc.document_id)
                                }
                                disabled={doc.status !== "rejected"}
                              >
                                <RefreshTwoToneIcon
                                  color={
                                    doc.status === "rejected"
                                      ? "warning"
                                      : "disabled"
                                  }
                                />
                              </Button>
                            </span>
                          </Tooltip>

                          {/* ยกเลิกการส่ง */}
                          <Tooltip title="ยกเลิกการส่ง">
                            <span>
                              <Button
                                sx={{ minWidth: "auto", p: 0 }}
                                onClick={() =>
                                  handleOpenCancelDialog(doc.document_id)
                                }
                                disabled={doc.status !== "pending"}
                              >
                                <DeleteForeverTwoToneIcon
                                  color={
                                    doc.status === "pending"
                                      ? "error"
                                      : "disabled"
                                  }
                                />
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={
                            doc.status.charAt(0).toUpperCase() +
                            doc.status.slice(1)
                          }
                          color={
                            doc.status === "approved"
                              ? "success"
                              : doc.status === "rejected"
                              ? "error"
                              : "default"
                          }
                          sx={{
                            width: "90px",
                            textAlign: "center",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
