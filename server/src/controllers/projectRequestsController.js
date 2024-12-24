const db = require("../config/db");

// สร้างคำร้องโครงงานใหม่
exports.createRequest = async (req, res) => {
  const {
    project_name, // ภาษาไทย
    project_name_eng, // ภาษาอังกฤษ
    groupMembers,
    advisorId,
    studentId,
    project_type,
  } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!project_name || !project_name_eng || !project_type) {
    return res.status(400).json({
      success: false,
      message: "Project name (TH/EN) and type are required.",
    });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ตรวจสอบว่ามีสมาชิกในกลุ่มที่อยู่ในโครงการที่ pending หรือ approved
    const [existingProjects] = await connection.query(
      `
      SELECT sp.student_id
      FROM students_projects sp
      JOIN project_requests pr ON sp.request_id = pr.request_id
      WHERE sp.student_id IN (?) AND pr.status IN ('pending', 'approved')
      `,
      [groupMembers]
    );

    if (existingProjects.length > 0) {
      const conflictingMembers = existingProjects.map((row) => row.student_id);
      return res.status(400).json({
        success: false,
        message: `Members with IDs ${conflictingMembers.join(
          ", "
        )} are already part of a pending or approved project.`,
      });
    }

    // เพิ่มคำร้องใหม่
    const [result] = await connection.query(
      `
      INSERT INTO project_requests 
      (project_name, project_name_eng, project_type, advisor_id, student_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())
      `,
      [project_name, project_name_eng, project_type, advisorId, studentId]
    );

    const requestId = result.insertId;

    // เพิ่มสมาชิกในกลุ่ม
    for (const memberId of groupMembers) {
      await connection.query(
        `INSERT INTO students_projects (request_id, student_id) VALUES (?, ?)`,
        [requestId, memberId]
      );
    }

    await connection.commit();
    res.status(200).json({ success: true, requestId });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating project request:", error.message);
    res.status(500).json({ success: false, error: "Failed to save data." });
  } finally {
    connection.release();
  }
};

// ดึงสถานะคำร้องโครงงานของนักเรียน
exports.getStudentRequests = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res
      .status(400)
      .json({ success: false, error: "Student ID is required." });
  }

  try {
    const [results] = await db.query(
      `
      SELECT pr.request_id, pr.project_name, pr.project_name_eng, pr.status, pr.created_at
      FROM project_requests pr
      WHERE pr.student_id = ?
      ORDER BY pr.created_at DESC
      `,
      [studentId]
    );
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching student requests:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch requests." });
  }
};

// ดึงคำร้องโครงงานทั้งหมด
exports.getAllRequests = async (req, res) => {
  try {
    const [projects] = await db.query(
      `
      SELECT pr.request_id, pr.project_name, pr.project_name_eng, pr.status, 
             pr.advisor_id, ti.teacher_name,
             GROUP_CONCAT(DISTINCT u.username) AS students
      FROM project_requests pr
      LEFT JOIN teacher_info ti ON pr.advisor_id = ti.teacher_id
      LEFT JOIN students_projects sp ON pr.request_id = sp.request_id
      LEFT JOIN users u ON sp.student_id = u.user_id
      GROUP BY pr.request_id
      ORDER BY pr.created_at DESC;
      `
    );
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching project requests:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch requests." });
  }
};

// อัปเดตสถานะคำร้อง
exports.updateRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;

  if (!requestId || !status) {
    return res
      .status(400)
      .json({ success: false, message: "Request ID and status are required." });
  }

  try {
    const [result] = await db.query(
      `UPDATE project_requests SET status = ?, updated_at = NOW() WHERE request_id = ?`,
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Request not found." });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating request status:", error.message);
    res.status(500).json({ success: false, error: "Failed to update status." });
  }
};
