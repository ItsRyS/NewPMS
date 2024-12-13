import { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMediaQuery, useTheme } from "@mui/material";
import api from "../../services/api"; // สำหรับการเชื่อมต่อ API

const Documentation = () => {
  const [documents, setDocuments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md")); // สำหรับหน้าจอขนาดเล็ก

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get("/document");
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleOpenDialog = (doc) => {
    setSelectedDocument(doc);
    setLoading(true); // เริ่ม Loading
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDocument(null);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Documentation
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.doc_id}>
                  <TableCell>{doc.doc_title}</TableCell>
                  <TableCell>{doc.doc_description}</TableCell>
                  <TableCell>{doc.uploaded_by}</TableCell>
                  <TableCell>
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(doc)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialog สำหรับแสดงเอกสาร */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullScreen={fullScreen} // ทำให้เต็มหน้าจอในมือถือ
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": { width: "100%", height: "100%" },
        }}
      >
        {/* ปุ่ม Close */}
        <IconButton
          onClick={handleCloseDialog}
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
          {loading && <CircularProgress />} {/* แสดง Loading */}
          {selectedDocument && (
            <iframe
              src={`http://localhost:5000/${selectedDocument.doc_path}`}
              width="100%"
              height="100%"
              onLoad={() => setLoading(false)} // หยุด Loading เมื่อ iframe โหลดเสร็จ
              style={{
                border: "none",
                display: loading ? "none" : "block", // ซ่อน iframe จนกว่าจะโหลดเสร็จ
              }}
              sandbox="allow-scripts allow-same-origin" // เพิ่มความปลอดภัย
              title={selectedDocument.doc_title}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Documentation;
