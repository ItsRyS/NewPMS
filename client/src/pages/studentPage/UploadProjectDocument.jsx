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
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import RemoveRedEyeTwoToneIcon from "@mui/icons-material/RemoveRedEyeTwoTone";
import DeleteForeverTwoToneIcon from "@mui/icons-material/DeleteForeverTwoTone";
import RefreshTwoToneIcon from "@mui/icons-material/RefreshTwoTone";
import ArrowDownwardTwoToneIcon from "@mui/icons-material/ArrowDownwardTwoTone";
import ArrowUpwardTwoToneIcon from "@mui/icons-material/ArrowUpwardTwoTone";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import api from "../../services/api";
import CloseIcon from "@mui/icons-material/Close";
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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm")); // สำหรับหน้าจอขนาดเล็ก

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
        const typesResponse = await api.get(
          `/project-documents/types-with-status?requestId=${approvedRequest.request_id}`
        );
        const historyResponse = await api.get(
          `/project-documents/history?requestId=${approvedRequest.request_id}`
        );
        setDocumentHistory(historyResponse.data);
        setDocumentTypes(typesResponse.data);
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
    //<Paper elevation={3} sx={{ padding: 4, borderRadius: 3, width: "100%", mx: "auto" }}>
    <>
      <Grid
        container
        spacing={4}
        alignItems={"stretch"}
        justifyContent={"center"}
      >
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            {/* Header */}
            <Typography variant="h6" gutterBottom>
              Upload Document
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Document Upload Form */}
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

            {/* Selected File Information */}
            <Typography
              variant="body2"
              sx={{ mb: 2, color: file ? "text.primary" : "text.secondary" }}
            >
              {file ? `ไฟล์ที่เลือก: ${file.name}` : "ยังไม่ได้เลือกเอกสาร"}
            </Typography>

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
              sx={{ mb: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : "Upload Document"}
            </Button>

            {/* Required Documents Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                เอกสารทั้งหมดที่ต้องส่ง
              </Typography>
              {documentTypes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No documents required.
                </Typography>
              ) : (
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {documentTypes.map((type) => (
                    <Box
                      component="li"
                      key={type.type_id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color:
                          type.status === "approved"
                            ? "success.main"
                            : "text.secondary",
                      }}
                    >
                      {/* Icon ตามสถานะ */}
                      {type.status === "approved" ? (
                        <AssignmentTurnedInIcon
                          sx={{ color: "success.main" }}
                        />
                      ) : (
                        <AssignmentIcon sx={{ color: "text.secondary" }} />
                      )}

                      {/* ชื่อเอกสาร */}
                      <Typography variant="body2">{type.type_name}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Submission History */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h6"
                sx={{ textAlign: "center", fontWeight: "bold" }}
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
            <TableContainer sx={{ maxHeight: 550, overflowY: "auto" }}>
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
                        {doc.status === "rejected" && (
                          <Typography variant="body2" color="error">
                            หมายเหตุ: {doc.reject_reason}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1,
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
                          sx={{ width: "90px", textAlign: "center" }}
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
            คุณแน่ใจแล้วหรือว่าต้องการยกเลิกการส่งเอกสารนี้?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            ไม่
          </Button>
          <Button onClick={handleCancelSubmission} color="error">
            ใช่ ยกเลิกการส่ง
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        fullScreen={fullScreen}
        maxWidth="lg"
        fullWidth
        sx={{ "& .MuiDialog-paper": { width: "100%", height: "100%" } }} // แทน maxHeight เดิม
      >
        <IconButton
          onClick={handleCloseViewDialog}
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{
            padding: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedFilePath ? (
            <iframe
              src={selectedFilePath}
              width="100%"
              height="100%"
              title="Document Viewer"
              style={{ border: "none" }}
            />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Document not available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default UploadProjectDocument;
