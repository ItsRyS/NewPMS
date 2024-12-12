const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Create a new project request
router.post("/create", async (req, res) => {
  const { projectName, groupMembers, advisorId, studentId } = req.body;

  const connection = await db.getConnection(); // Create connection
  try {
    await connection.beginTransaction(); // Begin Transaction

    // Insert into project_requests
    const [result] = await connection.query(
      `INSERT INTO project_requests (project_name, advisor_id, student_id, status, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
      [projectName, advisorId, studentId]
    );
    const requestId = result.insertId;

    // Insert into students_projects
    for (const memberId of groupMembers) {
      await connection.query(
        `INSERT INTO students_projects (request_id, student_id)
         VALUES (?, ?)`,
        [requestId, memberId]
      );
    }

    await connection.commit(); // Commit changes
    res.status(200).json({ success: true, requestId });
  } catch (error) {
    await connection.rollback(); // Rollback on error
    console.error("Database Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to save data" });
  } finally {
    connection.release(); // Release connection
  }
});

// Get the status of project requests for a specific student
router.get("/status", async (req, res) => {
  const { studentId } = req.query;

  try {
    const [results] = await db.query(
      `SELECT request_id, project_name, status, created_at 
       FROM project_requests 
       WHERE student_id = ? 
       ORDER BY created_at DESC`,
      [studentId]
    );
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching statuses:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch data" });
  }
});

// Get all project requests
router.get("/all", async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT pr.request_id, pr.project_name, pr.status, 
       pr.advisor_id, ti.teacher_name,
       GROUP_CONCAT(DISTINCT u.username) AS students
FROM project_requests pr
LEFT JOIN teacher_info ti ON pr.advisor_id = ti.teacher_id
LEFT JOIN students_projects sp ON pr.request_id = sp.request_id
LEFT JOIN users u ON sp.student_id = u.user_id
GROUP BY pr.request_id
ORDER BY pr.created_at DESC;

    `);

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching project requests:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch data" });
  }
});

// Update the status of a project request
router.post("/update-status", async (req, res) => {
  const { requestId, status } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE project_requests SET status = ?, updated_at = NOW() WHERE request_id = ?`,
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Request not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error.message);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
});

module.exports = router;
