const path = require("path");
const db = require("../config/db");
const fs = require("fs");

// อัปโหลดเอกสาร
exports.uploadDocument = async (req, res) => {
  const { doc_title, doc_description, uploaded_by } = req.body;
  const doc_path = req.file ? req.file.path : null;

  if (!doc_title || !doc_description || !uploaded_by || !doc_path) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const [userExists] = await db.query("SELECT user_id FROM users WHERE user_id = ?", [uploaded_by]);
    if (userExists.length === 0) {
      return res.status(400).json({ message: "Invalid uploaded_by user ID." });
    }

    const [result] = await db.query(
      `INSERT INTO document_forms (doc_title, doc_description, doc_path, uploaded_by, upload_date)
       VALUES (?, ?, ?, ?, ?)`,
      [doc_title, doc_description, doc_path, uploaded_by, new Date()]
    );
    res.status(200).json({ message: "File uploaded successfully", doc_id: result.insertId });
  } catch (error) {
    console.error("Error inserting document:", error.message);
    res.status(500).json({ message: "Database insertion failed", error: error.message });
  }
};



// ดึงข้อมูลเอกสารทั้งหมด
exports.getDocuments = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        df.doc_id, 
        df.doc_title, 
        df.doc_description, 
        df.doc_path, 
        u.username AS uploaded_by, 
        df.upload_date 
      FROM document_forms df
      JOIN users u ON df.uploaded_by = u.user_id
      ORDER BY df.upload_date DESC
    `);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching documents:", error.message);
    res.status(500).json({ message: "Failed to retrieve documents", error: error.message });
  }
};


// ลบเอกสาร
exports.deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(`SELECT doc_path FROM document_forms WHERE doc_id = ?`, [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = results[0].doc_path;

    // ลบไฟล์จากระบบ
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query(`DELETE FROM document_forms WHERE doc_id = ?`, [id]);
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error.message);
    res.status(500).json({ message: "Failed to delete document", error: error.message });
  }
};
