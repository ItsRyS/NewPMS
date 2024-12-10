const express = require("express");
const router = express.Router();
const db = require("../config/db");

// สร้างคำขอเปิดหัวข้อโครงงาน
router.post("/create", async (req, res) => {
  const { projectName, groupMembers, advisorId, studentId } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO project_requests (project_name, group_members, advisor_id, student_id, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [projectName, JSON.stringify(groupMembers), advisorId, studentId]
    );
    res.status(200).json({ success: true, requestId: result.insertId });
  } catch (error) {
    console.error("Database Error:", error.message);
    res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  }
});

// ดึงสถานะของคำร้องขอ
router.get("/status", async (req, res) => {
  const { studentId } = req.query;

  try {
    const [results] = await db.query(
      `SELECT request_id, project_name, status FROM project_requests WHERE student_id = ?`,
      [studentId]
    );
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching statuses:", error.message);
    res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

module.exports = router;
