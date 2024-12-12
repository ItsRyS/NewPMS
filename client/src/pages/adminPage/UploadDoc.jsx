import { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useMediaQuery, useTheme } from "@mui/material";
import api from "../../services/api";
const UploadDoc = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [documents, setDocuments] = useState([]); // Default to an empty array
  const [pdfPath, setPdfPath] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("Loading...");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md")); // Full screen for small devices

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch documents from the server
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get("/document");

        // Validate response data
        if (Array.isArray(response.data)) {
          setDocuments(response.data);
        } else {
          console.error("Invalid response format:", response.data);
          setDocuments([]);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch documents",
          severity: "error",
        });
      }
    };
    const fetchUsername = async () => {
      try {
        const response = await api.get("/auth/check-session");
        if (response.data.isAuthenticated) {
          setUsername(response.data.user.username);
        }
      } catch (error) {
        console.error("Failed to fetch session info:", error);
      }
    };
    fetchUsername();
    fetchDocuments();
  }, []);

  // File change handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type !== "application/pdf") {
      setSnackbar({
        open: true,
        message: "Please upload only PDF files.",
        severity: "error",
      });
      setFile(null);
      setFileName("");
    } else {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // Upload document
  const handleUpload = async () => {
    if (!file || !docTitle || !docDescription) {
      setSnackbar({
        open: true,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_title", docTitle);
    formData.append("doc_description", docDescription);
    formData.append("uploaded_by", username);

    try {
      const response = await api.post("/document/upload", formData);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      // ดึงข้อมูลใหม่จากเซิร์ฟเวอร์หลังจากอัปโหลดสำเร็จ
      const updatedDocuments = await api.get("/document");
      setDocuments(updatedDocuments.data);

      // รีเซ็ตฟอร์ม
      setFile(null);
      setFileName("");
      setDocTitle("");
      setDocDescription("");
    } catch (error) {
      console.error("Error uploading document:", error);
      setSnackbar({
        open: true,
        message: "การเพิ่มแบบฟอร์มเอกสารล้มเหลว",
        severity: "error",
      });
    }
  };

  // View document
  const handleViewDocument = (docPath) => {
    if (!docPath) {
      setSnackbar({
        open: true,
        message: "ไม่เจอแบบฟอร์มเอกสาร",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    setPdfPath(`http://localhost:5000/${docPath}`);
    setOpenDialog(true);
  };

  // Delete document
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("คุณแน่ใจแล้ว ว่าจะลบเอกสารนี้?")) return;

    try {
      await api.delete(`/document/${docId}`);
      setSnackbar({
        open: true,
        message: "ลบเอกสารสำเร็จ",
        severity: "success",
      });
      setDocuments((prev) => prev.filter((doc) => doc.doc_id !== docId));
    } catch (error) {
      console.error("Error deleting document:", error);
      setSnackbar({
        open: true,
        message: "ลบเอกสารไม่สำเร็จ",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f0f4f8" }}>
      <Paper variant="outlined">
        <Grid container>
          {/* Upload Section */}
          <Grid item xs={6} sx={{ borderRight: "1px solid #000" }}>
            <Box p={2}>
              <Typography variant="h6" align="center">
                เพิ่มแบบฟอร์มเอกสาร
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
                rows={4}
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" component="label" sx={{ mb: 2 }}>
                เลือกไฟล์
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {fileName && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  Selected File: {fileName}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleUpload}
              >
                เพิ่มแบบฟอร์มเอกสาร
              </Button>
            </Box>
          </Grid>

          {/* Document List Section */}
          <Grid item xs={6}>
            <Box p={2}>
              <Typography variant="h6" align="center">
                ประวัติการเพิ่มแบบฟอร์มเอกสาร
              </Typography>
              {documents.length === 0 ? (
                <Typography
                  variant="body2"
                  align="center"
                  color="textSecondary"
                >
                  No documents found.
                </Typography>
              ) : (
                documents.map(
                  (doc) =>
                    doc && ( // Safeguard for undefined or null doc
                      <Box
                        key={doc.doc_id}
                        mb={2}
                        sx={{
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          padding: "10px",
                          justifyContent: "space-between",
                          display: "flex",
                        }}
                      >
                        <Box>
                          <Typography variant="body1">
                            <strong>ชื่อแบบฟอร์มเอกสาร : </strong>{" "}
                            {doc.doc_title}
                          </Typography>
                          <Typography variant="body2">
                            <strong>คำอธิบาย : </strong> {doc.doc_description}
                          </Typography>
                          <Typography variant="body2">
                            <strong>วันที่เพิ่ม : </strong>{" "}
                            {new Date(doc.upload_date).toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>เพิ่มโดย : </strong> {doc.uploaded_by}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="outlined"
                            color="primary"
                            sx={{ mr: 1 }}
                            onClick={() => handleViewDocument(doc.doc_path)}
                          >
                            View
                          </Typography>
                          <Typography
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDeleteDocument(doc.doc_id)}
                          >
                            Delete
                          </Typography>
                        </Box>
                      </Box>
                    )
                )
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullScreen={fullScreen} // Full screen for mobile
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": { width: "100%", height: "100%" },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={() => setOpenDialog(false)}
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{
            padding: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading && <CircularProgress />}
          {pdfPath && (
            <iframe
              src={pdfPath}
              width="100%"
              height="100%"
              onLoad={() => setLoading(false)}
              style={{
                border: "none",
                display: loading ? "none" : "block",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadDoc;
