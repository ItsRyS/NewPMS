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

// ดึงข้อมูลประเภทเอกสาร
exports.getDocumentTypes = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM document_types");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching document types:", error.message);
    res.status(500).json({ message: "Failed to fetch document types." });
  }
};

exports.getDocumentTypesWithStatus = async (req, res) => {
  const { requestId } = req.query; // รับ requestId จาก query

  try {
    const [results] = await db.query(
      `SELECT 
         dt.type_id, 
         dt.type_name, 
         pd.status 
       FROM document_types dt
       LEFT JOIN project_documents pd 
         ON dt.type_id = pd.type_id AND pd.request_id = ?
       ORDER BY dt.type_id`,
      [requestId]
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching document types with status:", error.message);
    res.status(500).json({ message: "Failed to fetch document types with status." });
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

// ดึงประวัติเอกสาร
exports.getDocumentHistory = async (req, res) => {
  const { requestId } = req.query;
  try {
    const [documents] = await db.query(
      `SELECT 
         pd.document_id, 
         pd.file_path,
         dt.type_name, 
         pd.submitted_at,
         pd.status, 
         pd.reject_reason 
       FROM project_documents pd
       LEFT JOIN document_types dt ON pd.type_id = dt.type_id
       WHERE pd.request_id = ?
       ORDER BY pd.submitted_at DESC`,
      [requestId]
    );
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching document history:", error.message);
    res.status(500).json({ message: "Failed to fetch document history." });
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
      "UPDATE project_documents SET status = 'approved', reject_reason = NULL WHERE document_id = ?",
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

// ส่งเอกสารใหม่
exports.resubmitDocument = async (req, res) => {
  const { id } = req.params; // document_id
  const file_path = req.file ? req.file.path : null;

  if (!file_path) {
    return res.status(400).json({ message: "File upload failed." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [documentDetails] = await connection.query(
      "SELECT request_id, type_id, file_path FROM project_documents WHERE document_id = ?",
      [id]
    );

    if (!documentDetails || documentDetails.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    const { request_id, type_id, file_path: oldFilePath } = documentDetails[0];

    if (oldFilePath && fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    await connection.query(
      "DELETE FROM project_documents WHERE document_id = ?",
      [id]
    );

    await connection.query(
      "INSERT INTO project_documents (request_id, type_id, file_path, status) VALUES (?, ?, ?, 'pending')",
      [request_id, type_id, file_path]
    );

    await connection.commit();
    res.status(200).json({ message: "Document resubmitted successfully." });
  } catch (error) {
    await connection.rollback();
    console.error("Error resubmitting document:", error.message);
    res.status(500).json({ message: "Failed to resubmit document." });
  } finally {
    connection.release();
  }
};
