const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../config/db"); // ใช้การเชื่อมต่อฐานข้อมูลจาก db.js

// ตั้งค่า multer สำหรับการอัปโหลดไฟล์ไปยังโฟลเดอร์ /upload/Document
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/Document");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// API สำหรับอัปโหลดไฟล์เอกสาร
router.post("/upload", upload.single("file"), (req, res) => {
  const { doc_title, doc_description, uploaded_by } = req.body;
  const doc_path = req.file ? req.file.path : null;
  const upload_date = new Date();

  if (!doc_path) {
    return res.status(400).json({ message: "File upload failed" });
  }

  const sql = `
    INSERT INTO document (doc_title, doc_description, doc_path, uploaded_by, upload_date)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [doc_title, doc_description, doc_path, uploaded_by, upload_date], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database insertion failed" });
    }
    res.status(200).json({ message: "File uploaded successfully" });
  });
});

// เพิ่ม API สำหรับดึงข้อมูลเอกสารทั้งหมด
router.get("/", (req, res) => {
  const sql = `SELECT * FROM document ORDER BY upload_date DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve documents" });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
