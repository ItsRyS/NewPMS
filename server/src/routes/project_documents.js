const express = require("express");
const router = express.Router();
const multer = require("multer");
const projectDocumentsController = require("../controllers/projectDocumentsController");

const storage = multer.diskStorage({
  destination: "upload/project-documents",
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
    const uniqueSuffix = Date.now();
    const sanitizedName = originalName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
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
