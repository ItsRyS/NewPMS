const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const documentController = require("../controllers/documentController");

// ตั้งค่า multer สำหรับการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/Document");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const originalName = file.originalname.replace(/\s+/g, "_"); // ลบช่องว่างจากชื่อไฟล์
    cb(null, `${uniqueSuffix}_${originalName}`);
  },
});
const upload = multer({ storage: storage });

// Routes
router.post("/upload", upload.single("file"), documentController.uploadDocument);
router.get("/", documentController.getDocuments);
router.delete("/:id", documentController.deleteDocument);


module.exports = router;
