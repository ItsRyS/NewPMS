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
  const [documents, setDocuments] = useState([]);
  const [pdfPath, setPdfPath] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("Loading...");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get("/document");
        setDocuments(response.data); // รับข้อมูลใหม่ที่มี username
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
          setUsername(response.data.user.user_id); // ตั้ง username
        }
      } catch (error) {
        console.error("Failed to fetch session info:", error);
      }
    };

    fetchUsername();
    fetchDocuments();
  }, []);

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

  const handleUpload = async () => {
    if (!file || !docTitle || !docDescription) {
      setSnackbar({
        open: true,
        message: "Please fill out all fields.",
        severity: "error",
      });
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_title", docTitle);
    formData.append("doc_description", docDescription);
    formData.append("uploaded_by", username); // ส่ง user_id แทน username
  
    try {
      const response = await api.post("/document/upload", formData);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });
  
      const updatedDocuments = await api.get("/document");
      setDocuments(updatedDocuments.data);
  
      setFile(null);
      setFileName("");
      setDocTitle("");
      setDocDescription("");
    } catch (error) {
      console.error("Error uploading document:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload document.",
        severity: "error",
      });
    }
  };
  

  const handleViewDocument = (docPath) => {
    if (!docPath) {
      setSnackbar({
        open: true,
        message: "Document not found.",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    setPdfPath(`http://localhost:5000/${docPath}`);
    setOpenDialog(true);
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await api.delete(`/document/${docId}`);
      setSnackbar({
        open: true,
        message: "Document deleted successfully.",
        severity: "success",
      });
      setDocuments((prev) => prev.filter((doc) => doc.doc_id !== docId));
    } catch (error) {
      console.error("Error deleting document:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete document.",
        severity: "error",
      });
    }
  };

  return (
    
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
        <Grid container spacing={4}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Upload Document
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
              <Button
                variant="contained"
                component="label"
                sx={{ mb: 2, display: "block" }}
              >
                Select File
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {fileName && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Selected File: {fileName}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleUpload}
              >
                Upload Document
              </Button>
            </Box>
          </Grid>

          {/* Document List Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Document List
            </Typography>
            {documents.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No documents found.
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                {documents.map((doc) => (
                  <Paper
                    key={doc.doc_id}
                    elevation={2}
                    sx={{
                      padding: 2,
                      mb: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      "&:hover": { backgroundColor: "#f1f1f1" },
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{doc.doc_title}</Typography>
                      <Typography variant="body2">
                        {doc.doc_description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Uploaded by: {doc.uploaded_by} |{" "}
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
      

      {/* PDF Viewer Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullScreen={fullScreen} // ทำให้เต็มหน้าจอในมือถือ
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": { width: "90%", height: "90%" }, // ปรับขนาด Dialog
        }}
      >
        {/* ปุ่ม Close */}
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
            height: "100%", // ใช้พื้นที่ของ Dialog เต็มที่
          }}
        >
          {loading && <CircularProgress />} {/* แสดง Loading */}
          {pdfPath && (
            <iframe
              src={pdfPath}
              width="100%"
              height="100%" // ใช้พื้นที่ของ DialogContent เต็มที่
              onLoad={() => setLoading(false)}
              style={{
                border: "none",
                display: loading ? "none" : "block", // ซ่อน iframe จนกว่าจะโหลดเสร็จ
              }}
              sandbox="allow-scripts allow-same-origin"
              title="Document Viewer"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Paper>
    
  );
};

export default UploadDoc;
