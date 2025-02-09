const db = require("../config/db");

const multer = require("multer");
const path = require("path");

// 📌 ตั้งค่าการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: "./upload/project-documents/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 📌 อัปโหลดโครงงานเก่า
exports.uploadOldProject = async (req, res) => {
  const { project_name_th, project_name_eng, project_type, advisor_id, project_create_time } = req.body;
  const file_path = req.file ? `/upload/project-documents/${req.file.filename}` : null;

  if (!file_path) {
    return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์ PDF" });
  }

  try {
    // ✅ ดึงชื่อประเภทโครงงานจากฐานข้อมูล
    const [typeResult] = await db.query(
      "SELECT project_type_name FROM project_types WHERE project_type_id = ?",
      [project_type]
    );

    if (!typeResult.length) {
      return res.status(400).json({ error: "ประเภทโครงงานไม่ถูกต้อง" });
    }

    const projectTypeName = typeResult[0].project_type_name;

    await db.query(
      `INSERT INTO project_release
        (project_name_th, project_name_eng, project_type, advisor_id, project_status, project_create_time, file_path)
        VALUES (?, ?, ?, ?, 'complete', ?, ?)`,
      [project_name_th, project_name_eng, projectTypeName, advisor_id, project_create_time, file_path]
    );

    res.status(201).json({ message: "เพิ่มโครงงานเก่าสำเร็จ!" });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  }
};

// อัพเดทสถานะคำขอ
exports.updateRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({
      success: false,
      message: 'Request ID and status are required.'
    });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // อัพเดทสถานะคำขอโครงงาน
    const [result] = await connection.query(
      `UPDATE project_requests SET status = ?, updated_at = NOW() WHERE request_id = ?`,
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    // จัดการกรณีอนุมัติ: ย้ายไปยัง project_release
    if (status === 'approved') {
      const [projectData] = await connection.query(
        `SELECT
          pr.project_name AS project_name_th,
          pr.project_name_eng AS project_name_eng,
          pr.project_type,
          NOW() AS project_create_time,
          pr.advisor_id
        FROM project_requests pr
        WHERE pr.request_id = ?`,
        [requestId]
      );

      if (projectData.length > 0) {
        const project = projectData[0];
        const [insertResult] = await connection.query(
          `INSERT INTO project_release
          (project_name_th, project_name_eng, project_type, project_status, project_create_time, advisor_id)
          VALUES (?, ?, ?, 'operate', ?, ?)`,
          [
            project.project_name_th,
            project.project_name_eng,
            project.project_type,
            project.project_create_time,
            project.advisor_id,
          ]
        );

        await connection.query(
          `UPDATE students_projects SET project_id = ? WHERE request_id = ?`,
          [insertResult.insertId, requestId]
        );
      }
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Status updated successfully.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status.'
    });
  } finally {
    connection.release();
  }
};

// ดึงโครงงานที่ได้รับการอนุมัติ
exports.getApprovedProjects = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT
        pr.project_id,
        pr.project_name_th,
        pr.project_name_eng,
        pr.project_status,
        pr.project_type,
        pr.project_create_time,
        ti.teacher_name AS project_advisor,
        GROUP_CONCAT(DISTINCT u.username SEPARATOR ', ') AS team_members
      FROM project_release pr
      LEFT JOIN students_projects sp ON pr.project_id = sp.project_id
      LEFT JOIN users u ON sp.student_id = u.user_id
      LEFT JOIN teacher_info ti ON pr.advisor_id = ti.teacher_id
      WHERE pr.project_status IN ('operate', 'success', 'complete')
      GROUP BY pr.project_id
      ORDER BY pr.project_create_time DESC
    `);

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects.'
    });
  }
};

// ดึงประเภทโครงงาน
exports.getProjectTypes = async (req, res) => {
  try {
    const [projectTypes] = await db.query(
      `SELECT project_type_id, project_type_name
       FROM project_types
       ORDER BY project_type_name ASC`
    );

    res.status(200).json({
      success: true,
      data: projectTypes
    });
  } catch (error) {
    console.error('Error fetching project types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project types.'
    });
  }
};
exports.getProjectTypes = async (req, res) => {
  try {
    const [projectTypes] = await db.query(
      `SELECT project_type_id, project_type_name FROM project_types ORDER BY project_type_name ASC`
    );

    res.status(200).json({ success: true, data: projectTypes });
  } catch (error) {
    console.error('Error fetching project types:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project types.' });
  }
};


exports.getAdvisors = async (req, res) => {
  try {
    const [advisors] = await db.query(
      `SELECT teacher_id, teacher_name FROM teacher_info ORDER BY teacher_name ASC`
    );

    res.status(200).json({ success: true, data: advisors });
  } catch (error) {
    console.error('Error fetching advisors:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch advisors.' });
  }
};
exports.upload = upload;