const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import connection to MySQL

// สร้างคำขอเปิดหัวข้อโครงงาน
router.post('/create', async (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});




// ดึงคำขอเปิดหัวข้อทั้งหมด (สำหรับอาจารย์)
router.get('/all', async (req, res) => {
  try {
    const [requests] = await db.query(`SELECT * FROM project_requests`);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// อนุมัติ/ปฏิเสธคำขอ
router.post('/update-status', async (req, res) => {
  const { requestId, status } = req.body;

  try {
    await db.query(`UPDATE project_requests SET status = ? WHERE request_id = ?`, [status, requestId]);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
