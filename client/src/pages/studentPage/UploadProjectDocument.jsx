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
  ListItemText,
  Grid,
  Chip,
} from "@mui/material";
import api from "../../services/api";

const UploadProjectDocument = () => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [file, setFile] = useState(null);
  const [approvedProject, setApprovedProject] = useState(null);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
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

    fetchData();
  }, []);

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
      const response = await api.post("/project-documents/upload", formData);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      setSelectedType("");
      setFile(null);

      const historyResponse = await api.get(
        `/project-documents/history?requestId=${approvedProject.request_id}`
      );
      setDocumentHistory(historyResponse.data);
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

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Upload Project Document
      </Typography>
      <Grid container spacing={4}>
        {/* Left Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Upload Document
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Approved Project</InputLabel>
            <Select
              value={approvedProject ? approvedProject.request_id : ""}
              disabled
              label="Approved Project"
            >
              {approvedProject ? (
                <MenuItem value={approvedProject.request_id}>
                  {approvedProject.project_name}
                </MenuItem>
              ) : (
                <MenuItem value="">No approved project</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
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

          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Choose File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography>{file.name}</Typography>}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Upload Document"}
          </Button>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Submission History
          </Typography>
          <List>
            {documentHistory.map((doc) => (
              <ListItem
                key={doc.document_id}
                sx={{ display: "flex", flexDirection: "row" }}
              >
                <ListItemText
                  primary={doc.type_name}
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Submitted at:{" "}
                        {new Date(doc.submitted_at).toLocaleString()}
                      </Typography>
                      {doc.status === "rejected" && (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          Reason: {doc.reject_reason}
                        </Typography>
                      )}
                    </>
                  }
                />
                <Box mt={1}>
                  {doc.status === "approved" ? (
                    <Chip label="Approved" color="success" />
                  ) : doc.status === "rejected" ? (
                    <Chip label="Rejected" color="error" />
                  ) : (
                    <Chip label="Pending" />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>

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
