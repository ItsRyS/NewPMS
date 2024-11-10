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
} from "@mui/material";
import axios from "axios";

const UploadDoc = () => {
  const [file, setFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [documents, setDocuments] = useState([]); // State สำหรับเก็บเอกสารที่ดึงมาจากฐานข้อมูล
  const [pdfPath, setPdfPath] = useState(""); // State สำหรับเก็บ path ของ PDF ที่จะดู
  const [openDialog, setOpenDialog] = useState(false); // State สำหรับควบคุมการแสดง Dialog

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/document");
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("กรุณาเลือกไฟล์ PDF เท่านั้น");
        setFile(null);
        setDocTitle("");
        return;
      }
      setFile(selectedFile);
      setDocTitle(selectedFile.name.replace(".pdf", ""));
    }
  };

  const handleUpload = async () => {
    if (!file || !docTitle || !docDescription) {
      alert("กรุณาเลือกไฟล์และกรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_title", docTitle);
    formData.append("doc_description", docDescription);
    formData.append("uploaded_by", 1); // Adjust user ID as needed

    try {
      const response = await axios.post(
        "http://localhost:5000/api/document/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(response.data.message);

      const newDoc = {
        doc_title: docTitle,
        doc_description: docDescription,
        doc_path: response.data.doc_path,
        uploaded_by: 1,
        upload_date: new Date().toISOString(),
      };
      setDocuments([newDoc, ...documents]);

      setFile(null);
      setDocTitle("");
      setDocDescription("");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("การอัปโหลดไฟล์ไม่สำเร็จ");
    }
  };

  const handleViewDocument = (docPath) => {
    setPdfPath(`http://localhost:5000/${docPath}`);
    setOpenDialog(true); // Open the dialog to view the PDF
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPdfPath(""); // Clear the PDF path when closing
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f0f4f8" }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" component="label">
          เพิ่มไฟล์
          <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
        </Button>
      </Box>

      <Paper variant="outlined">
        <Grid container>
          <Grid item xs={6} sx={{ borderRight: "1px solid #000" }}>
            <Box p={2}>
              <Typography variant="h6" align="center">
                Document in database
              </Typography>
              <TextField
                label="ชื่อเอกสาร"
                variant="outlined"
                fullWidth
                margin="normal"
                value={docTitle}
                disabled
              />
              <TextField
                label="คำอธิบายเอกสาร"
                variant="outlined"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleUpload}
              >
                เพิ่มเอกสาร
              </Button>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box p={2}>
              <Typography variant="h6" align="center">
                Document history
              </Typography>
              <Box>
                {documents.map((doc, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="body1">
                      <strong>ชื่อ:</strong> {doc.doc_title}
                    </Typography>
                    <Typography variant="body2">
                      <strong>คำอธิบาย:</strong> {doc.doc_description}
                    </Typography>
                    <Typography variant="body2">
                      <strong>วันที่:</strong>{" "}
                      {new Date(doc.upload_date).toLocaleString()}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewDocument(doc.doc_path)}
                    >
                      ดูเอกสาร
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        
        sx={{
          "& .MuiDialog-paper": { margin: 0, width: "100%", height: "100%" },
        }}
      >
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            padding: 0,
          }}
        >
          {pdfPath && (
            <iframe
              src={pdfPath}
              width="100%"
              height="100%"
              title="PDF Viewer"
              style={{ border: "none" }} // ลบขอบรอบ iframe
            ></iframe>
          )}
        </DialogContent>
        
      </Dialog>
    </Box>
  );
};

export default UploadDoc;
