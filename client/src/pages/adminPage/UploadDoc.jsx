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
  const [fileName, setFileName] = useState(""); // เก็บชื่อไฟล์ที่เลือก
  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [documents, setDocuments] = useState([]); 
  const [pdfPath, setPdfPath] = useState(""); 
  const [openDialog, setOpenDialog] = useState(false); 

  // ดึงข้อมูลเอกสารจากเซิร์ฟเวอร์เมื่อเริ่มต้นหรือเมื่อเอกสารเปลี่ยนแปลง
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
        setFileName(""); // ล้างชื่อไฟล์หากไม่ใช่ PDF
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name); // บันทึกชื่อไฟล์
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
    formData.append("uploaded_by", 1);

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

      // ดึงข้อมูลเอกสารใหม่ทั้งหมดหลังจากอัปโหลดสำเร็จ
      const updatedDocuments = await axios.get("http://localhost:5000/api/document");
      setDocuments(updatedDocuments.data);

      setFile(null);
      setFileName(""); // ล้างชื่อไฟล์หลังอัปโหลดสำเร็จ
      setDocTitle("");
      setDocDescription("");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("การอัปโหลดไฟล์ไม่สำเร็จ");
    }
  };

  const handleViewDocument = (docPath) => {
    if (!docPath) {
      console.error("Document path is undefined");
      alert("ไม่พบเอกสารสำหรับการดู");
      return;
    }
    setPdfPath(`http://localhost:5000/${docPath}`);
    setOpenDialog(true);
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?")) {
      try {
        await axios.delete(`http://localhost:5000/api/document/${docId}`);
        alert("ลบเอกสารสำเร็จ");
        setDocuments(documents.filter((doc) => doc.doc_id !== docId));
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("การลบเอกสารล้มเหลว");
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPdfPath("");
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f0f4f8" }}>
      <Paper variant="outlined">
        <Grid container>
          <Grid item xs={6} sx={{ borderRight: "1px solid #000" }}>
            <Box p={2}>
              <Typography variant="h6" align="center">
                เพิ่มเอกสาร
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  label="ชื่อเอกสาร"
                  variant="outlined"
                  fullWidth
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
                <Button
                  variant="contained"
                  component="label"
                  sx={{ ml: 2 }}
                >
                  เลือกไฟล์
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
              {/* แสดงชื่อไฟล์ที่เลือก */}
              {fileName && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  ชื่อไฟล์ที่เลือก: {fileName}
                </Typography>
              )}
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
                อัปโหลดเอกสาร
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
                      sx={{ mr: 1 }}
                    >
                      ดูเอกสาร
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDeleteDocument(doc.doc_id)}
                    >
                      ลบเอกสาร
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
              style={{ border: "none" }}
            ></iframe>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UploadDoc;
