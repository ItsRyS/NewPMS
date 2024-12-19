const express = require("express");
const router = express.Router();
const multer = require("multer");
const projectDocumentsController = require("../controllers/projectDocumentsController");

// ตั้งค่า Multer สำหรับการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: "upload/project-documents",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// เส้นทางสำหรับการจัดการเอกสารโครงงาน
router.post("/upload", upload.single("file"), projectDocumentsController.uploadDocument); // อัปโหลดเอกสาร
router.get("/all", projectDocumentsController.getAllDocuments); // ดึงข้อมูลเอกสารทั้งหมด
router.get("/types", projectDocumentsController.getDocumentTypes); // ดึงประเภทเอกสาร
router.get("/history", projectDocumentsController.getDocumentHistory); // ดึงประวัติเอกสาร
router.delete("/delete/:documentId", projectDocumentsController.deleteDocument); // ลบเอกสาร
router.post("/approve/:id", projectDocumentsController.approveDocument); // อนุมัติเอกสาร
router.post("/reject/:id", projectDocumentsController.rejectDocument); // ปฏิเสธเอกสาร
router.post("/resubmit/:id", upload.single("file"), projectDocumentsController.resubmitDocument); // ส่งเอกสารใหม่

module.exports = router;
