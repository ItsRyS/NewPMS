const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../config/db");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/project-documents");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
// Endpoint สำหรับดึงข้อมูลประเภทเอกสาร
router.get("/", async (req, res) => {
  try {
    const [documentTypes] = await db.query(`
        SELECT * FROM document_types
      `);
    res.status(200).json(documentTypes);
  } catch (error) {
    console.error("Error fetching document types:", error.message);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทเอกสาร",
    });
  }
});
router.post("/upload", upload.single("file"), async (req, res) => {
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
});

router.get("/types", async (req, res) => {
  // ดึงข้อมูลประเภทเอกสาร
  try {
    const [types] = await db.query("SELECT * FROM document_types");
    res.status(200).json(types);
  } catch (error) {
    console.error("Error fetching document types:", error.message);
    res.status(500).json({ message: "Failed to fetch document types." });
  }
});
// ดึงข้อมูลเอกสารพร้อมโครงงานที่เกี่ยวข้อง
router.get("/all", async (req, res) => {
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
    res
      .status(500)
      .json({ success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร" });
  }
});

router.get("/history", async (req, res) => {
  const { requestId } = req.query;
  try {
    const [documents] = await db.query(
      `SELECT 
         pd.document_id, 
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
});
router.delete("/delete/:documentId", async (req, res) => {
  const { documentId } = req.params;

  try {
    await db.query("DELETE FROM project_documents WHERE document_id = ?", [
      documentId,
    ]);
    res.status(200).json({ message: "Document deleted successfully." });
  } catch (error) {
    console.error("Error deleting document:", error.message);
    res.status(500).json({ message: "Failed to delete document." });
  }
});

// Approve Document
router.post("/approve/:id", async (req, res) => {
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
    res.status(500).json({ message: "Database error." });
  }
});

// Reject Document
router.post("/reject/:id", async (req, res) => {
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
    res.status(500).json({ message: "Database error." });
  }
});
// Resubmit Document Endpoint
router.post("/resubmit/:id", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const file_path = req.file ? req.file.path : null;

  if (!file_path) {
    return res.status(400).json({ message: "File upload failed." });
  }

  try {
    // Fetch document details
    const [documentDetails] = await db.query(
      "SELECT type_id, request_id FROM project_documents WHERE document_id = ?",
      [id]
    );

    if (!documentDetails || documentDetails.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    const { type_id, request_id } = documentDetails[0];

    // Delete the rejected document
    await db.query("DELETE FROM project_documents WHERE document_id = ?", [id]);

    // Insert the new document
    await db.query(
      "INSERT INTO project_documents (request_id, type_id, file_path, status) VALUES (?, ?, ?, 'pending')",
      [request_id, type_id, file_path]
    );

    res.status(200).json({ message: "Document resubmitted successfully." });
  } catch (error) {
    console.error("Error resubmitting document:", error.message);
    res.status(500).json({ message: "Database error." });
  }
});



module.exports = router;
