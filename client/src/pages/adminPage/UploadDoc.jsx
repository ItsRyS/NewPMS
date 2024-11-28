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
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const UploadDoc = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [documents, setDocuments] = useState([]); // Default to an empty array
  const [pdfPath, setPdfPath] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch documents from the server
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/document");

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
    fetchDocuments();
  }, []);

  // File change handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type !== "application/pdf") {
      setSnackbar({
        open: true,
        message: "Please upload a PDF file only",
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
    formData.append("uploaded_by", 1);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/document/upload",
        formData
      );
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      // ดึงข้อมูลใหม่จากเซิร์ฟเวอร์หลังจากอัปโหลดสำเร็จ
      const updatedDocuments = await axios.get(
        "http://localhost:5000/api/document"
      );
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
        message: "การอัปโหลดเอกสารล้มเหลว",
        severity: "error",
      });
    }
  };

  // View document
  const handleViewDocument = (docPath) => {
    if (!docPath) {
      setSnackbar({
        open: true,
        message: "Document not found",
        severity: "error",
      });
      return;
    }
    setPdfPath(`http://localhost:5000/${docPath}`);
    setOpenDialog(true);
  };

  // Delete document
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await axios.delete(`http://localhost:5000/api/document/${docId}`);
      setSnackbar({
        open: true,
        message: "Document deleted successfully",
        severity: "success",
      });
      setDocuments((prev) => prev.filter((doc) => doc.doc_id !== docId));
    } catch (error) {
      console.error("Error deleting document:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete document",
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
                Add Document
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
                Choose File
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
                Upload Document
              </Button>
            </Box>
          </Grid>

          {/* Document List Section */}
          <Grid item xs={6}>
            <Box p={2}>
              <Typography variant="h6" align="center">
                Document History
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
                      <Box key={doc.doc_id} mb={2}>
                        <Typography variant="body1">
                          <strong>Title:</strong> {doc.doc_title}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Description:</strong> {doc.doc_description}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Date:</strong>{" "}
                          {new Date(doc.upload_date).toLocaleString()}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{ mr: 1 }}
                          onClick={() => handleViewDocument(doc.doc_path)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleDeleteDocument(doc.doc_id)}
                        >
                          Delete
                        </Button>
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
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": { width: "100%", height: "100%" },
        }}
      >
        <DialogContent
          sx={{ padding: 0, display: "flex", justifyContent: "center" }}
        >
          {pdfPath && (
            <iframe
              src={pdfPath}
              width="100%"
              height="100%"
              
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
