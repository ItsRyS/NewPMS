const path = require("path");
const db = require("../config/db");
const fs = require("fs");

// อัปโหลดเอกสาร
exports.uploadDocument = (req, res) => {
  const { doc_title, doc_description, uploaded_by } = req.body;
  const doc_path = req.file ? req.file.path : null;
  const upload_date = new Date();

  if (!doc_path) {
    return res.status(400).json({ message: "File upload failed" });
  }

  const sql = `
    INSERT INTO document_forms (doc_title, doc_description, doc_path, uploaded_by, upload_date)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [doc_title, doc_description, doc_path, uploaded_by, upload_date], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database insertion failed" });
    }
    res.status(200).json({ message: "File uploaded successfully", doc_id: result.insertId });
  });
};

// ดึงข้อมูลเอกสารทั้งหมด
exports.getDocuments = (req, res) => {
  const sql = `SELECT * FROM document_forms ORDER BY upload_date DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve documents" });
    }
    res.status(200).json(results);
  });
};

// ลบเอกสาร
exports.deleteDocument = (req, res) => {
    const { id } = req.params; // id ที่ส่งมาใน URL
  
    // ดึงข้อมูลเพื่อหาที่อยู่ไฟล์ก่อนลบ
    const selectSql = `SELECT doc_path FROM document_forms WHERE doc_id = ?`;
    db.query(selectSql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to find document" });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: "Document not found" });
      }
  
      const filePath = results[0].doc_path;
  
      // ลบไฟล์จากโฟลเดอร์
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to delete file" });
        }
  
        // ลบเอกสารจากฐานข้อมูล
        const deleteSql = `DELETE FROM document_forms WHERE doc_id = ?`; // เปลี่ยนจาก id เป็น doc_id
        db.query(deleteSql, [id], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to delete document" });
          }
          res.status(200).json({ message: "Document deleted successfully" });
        });
      });
    });
  };
