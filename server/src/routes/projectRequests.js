const express = require("express");
const router = express.Router();
const db = require("../config/db");

// สร้างคำขอเปิดหัวข้อโครงงาน
router.post("/create", async (req, res) => {
  const { projectName, groupMembers, advisorId, studentId } = req.body;

  const connection = await db.getConnection(); // สร้าง connection
  try {
    await connection.beginTransaction(); // เริ่ม Transaction

    // บันทึกใน project_requests
    const [result] = await connection.query(
      `INSERT INTO project_requests (project_name, group_members, advisor_id, student_id, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [projectName, JSON.stringify(groupMembers), advisorId, studentId]
    );
    const requestId = result.insertId;

    // บันทึกใน students_projects
    for (const memberId of groupMembers) {
      await connection.query(
        `INSERT INTO students_projects (request_id, student_id)
         VALUES (?, ?)`,
        [requestId, memberId]
      );
    }

    await connection.commit(); // ยืนยันการเปลี่ยนแปลง
    res.status(200).json({ success: true, requestId });
  } catch (error) {
    await connection.rollback(); // ย้อนกลับการเปลี่ยนแปลงหากเกิดข้อผิดพลาด
    console.error("Database Error:", error.message);
    res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  } finally {
    connection.release(); // ปล่อย connection
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
// ดึงคำร้องทั้งหมด
router.get("/all", async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT request_id, project_name, advisor_id, status FROM project_requests`
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching project requests:", error.message);
    res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// อัปเดตสถานะของคำร้อง
router.post("/update-status", async (req, res) => {
  const { requestId, status } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE project_requests SET status = ? WHERE request_id = ?`,
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error.message);
    res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
  }
});

module.exports = router;
