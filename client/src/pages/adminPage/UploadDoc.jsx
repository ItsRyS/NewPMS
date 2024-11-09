import { useState, useEffect } from "react";
import { Box, Button, Grid, Typography, Paper, TextField } from "@mui/material";
import axios from "axios";

const UploadDoc = () => {
  const [file, setFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [documents, setDocuments] = useState([]); // State สำหรับเก็บเอกสารที่ดึงมาจากฐานข้อมูล
  const [pdfPath, setPdfPath] = useState(""); // State สำหรับเก็บ path ของ PDF ที่จะดู

  useEffect(() => {
    // ดึงข้อมูลเอกสารทั้งหมดเมื่อเริ่มโหลด component
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
      // ตรวจสอบว่าไฟล์เป็น .pdf หรือไม่
      if (selectedFile.type !== "application/pdf") {
        alert("กรุณาเลือกไฟล์ PDF เท่านั้น");
        setFile(null);
        setDocTitle("");
        return;
      }

      // ตั้งค่า file และตั้งชื่อเอกสารตามชื่อไฟล์ PDF
      setFile(selectedFile);
      setDocTitle(selectedFile.name.replace(".pdf", "")); // ตั้งชื่อเอกสารเป็นชื่อไฟล์โดยไม่รวม ".pdf"
    }
  };

  const handleUpload = async () => {
    // ตรวจสอบว่าได้เลือกไฟล์และกรอกข้อมูลครบถ้วนหรือไม่
    if (!file || !docTitle || !docDescription) {
      alert("กรุณาเลือกไฟล์และกรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_title", docTitle);
    formData.append("doc_description", docDescription);
    formData.append("uploaded_by", 1); // ปรับ user ID ตามระบบจริง

    try {
      const response = await axios.post("http://localhost:5000/api/document/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert(response.data.message);

      // อัปเดตรายการเอกสารใหม่หลังจากอัปโหลด และเคลียร์ข้อมูลในช่อง
      const newDoc = {
        doc_title: docTitle,
        doc_description: docDescription,
        doc_path: response.data.doc_path, // ใช้ path ที่ส่งกลับมาจากเซิร์ฟเวอร์
        uploaded_by: 1,
        upload_date: new Date().toISOString(),
      };
      setDocuments([newDoc, ...documents]); // เพิ่มเอกสารใหม่ในรายการ
      
      // เคลียร์ช่องข้อมูล
      setFile(null);
      setDocTitle("");
      setDocDescription("");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("การอัปโหลดไฟล์ไม่สำเร็จ");
    }
  };

  const handleViewDocument = (docPath) => {
    // ตั้งค่า pdfPath ให้เป็น path ของเอกสารที่ต้องการดู
    setPdfPath(`http://localhost:5000/${docPath}`);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" component="label">
          เพิ่มไฟล์
          <input type="file" hidden accept=".pdf" onChange={handleFileChange} /> {/* อนุญาตเฉพาะไฟล์ .pdf */}
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
                disabled // ปิดการแก้ไขเพื่อใช้ชื่อจากไฟล์โดยตรง
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
              <Button variant="contained" color="primary" fullWidth onClick={handleUpload}>
                เพิ่มเอกสาร
              </Button>
            </Box>
          </Grid>

          {/* Document history */}
          <Grid item xs={6}>
            <Box p={2}>
              <Typography variant="h6" align="center">
                Document history
              </Typography>
              <Box>
                {documents.map((doc, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="body1"><strong>ชื่อ:</strong> {doc.doc_title}</Typography>
                    <Typography variant="body2"><strong>คำอธิบาย:</strong> {doc.doc_description}</Typography>
                    <Typography variant="body2"><strong>วันที่:</strong> {new Date(doc.upload_date).toLocaleString()}</Typography>
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

      {/* ส่วนแสดง PDF */}
      {pdfPath && (
        <Box mt={3}>
          <Typography variant="h6" align="center">
            แสดงเอกสาร PDF
          </Typography>
          <iframe
            src={pdfPath}
            width="100%"
            height="500px"
            title="PDF Viewer"
          ></iframe>
        </Box>
      )}
    </Box>
  );
};

export default UploadDoc;
