const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// อัปโหลดเอกสาร
exports.uploadDocument = async (req, res) => {
  const { request_id, type_id } = req.body;
  const file_path = req.file ? req.file.path : null;

  if (!file_path) {
    return res.status(400).json({ message: "File upload failed." });
  }

  try {
    await db.query(
      "INSERT INTO project_documents (request_id, type_id, file_path) VALUES (?, ?, ?)",
      [request_id, type_id, file_path]
    );
    res.status(200).json({ message: "Document uploaded successfully." });
  } catch (error) {
    console.error("Error uploading document:", error.message);
    res.status(500).json({ message: "Database error." });
  }
};

// ดึงข้อมูลเอกสารทั้งหมด
exports.getAllDocuments = async (req, res) => {
  try {
    const [documents] = await db.query(`
      SELECT 
        pd.document_id, 
        pr.project_name, 
        dt.type_name, 
        u.username AS student_name, 
        pd.file_path, 
        pd.submitted_at, 
        pd.status, 
        pd.reject_reason 
      FROM project_documents pd
      LEFT JOIN project_requests pr ON pd.request_id = pr.request_id
      LEFT JOIN document_types dt ON pd.type_id = dt.type_id
      LEFT JOIN users u ON pr.student_id = u.user_id
      ORDER BY pd.submitted_at DESC;
    `);
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching project documents:", error.message);
    res.status(500).json({ message: "Failed to fetch documents." });
  }
};

// ลบเอกสาร
exports.deleteDocument = async (req, res) => {
  const { documentId } = req.params;

  try {
    const [document] = await db.query(
      "SELECT file_path FROM project_documents WHERE document_id = ?",
      [documentId]
    );

    if (!document || document.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    const filePath = document[0].file_path;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query("DELETE FROM project_documents WHERE document_id = ?", [
      documentId,
    ]);
    res.status(200).json({ message: "Document deleted successfully." });
  } catch (error) {
    console.error("Error deleting document:", error.message);
    res.status(500).json({ message: "Failed to delete document." });
  }
};

// อนุมัติเอกสาร
exports.approveDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE project_documents SET status = 'approved' WHERE document_id = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Document approved successfully." });
    } else {
      res.status(404).json({ message: "Document not found." });
    }
  } catch (error) {
    console.error("Error approving document:", error.message);
    res.status(500).json({ message: "Failed to approve document." });
  }
};

// ปฏิเสธเอกสาร
exports.rejectDocument = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE project_documents SET status = 'rejected', reject_reason = ? WHERE document_id = ?",
      [reason, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Document rejected successfully." });
    } else {
      res.status(404).json({ message: "Document not found." });
    }
  } catch (error) {
    console.error("Error rejecting document:", error.message);
    res.status(500).json({ message: "Failed to reject document." });
  }
};
