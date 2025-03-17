const db = require('../config/db');
const sendEmail = require('../utils/emailService');
// ฟังก์ชันสร้างคำร้องโครงงานใหม่
exports.createRequest = async (req, res) => {
  const {
    project_name,
    project_name_eng,
    groupMembers,
    advisorId,
    studentId,
    project_type,
  } = req.body;

  if (!project_name || !project_name_eng || !project_type) {
    return res.status(400).json({
      success: false,
      message: 'Project name (TH/EN) and type are required.',
    });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ตรวจสอบว่านักเรียนมีคำร้องที่ `pending` หรือ `approved` หรือไม่
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
        message: `สมาชิกที่มีรหัส ${conflictingMembers.join(', ')}
                  มีคำร้องที่รอดำเนินการหรือได้รับการอนุมัติแล้ว`,
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
    console.error(' Error creating project request:', error.message);
    res.status(500).json({ success: false, error: 'Failed to save data.' });
  } finally {
    connection.release();
  }
};

exports.getStudentRequests = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ success: false, error: 'Student ID is required.' });
  }

  try {
    const [results] = await db.query(
      `
      SELECT pr.request_id, pr.project_name, pr.project_name_eng, pr.status, pr.created_at, pr.student_id
      FROM project_requests pr
      JOIN students_projects sp ON pr.request_id = sp.request_id
      WHERE sp.student_id = ?
      ORDER BY pr.created_at DESC
      `,
      [studentId]
    );

    res.status(200).json({
      success: true,
      data: results, // ดึงทุกสถานะ (pending, approved, rejected)
    });

  } catch (error) {
    console.error(' Error fetching student requests:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch requests.' });
  }
};


//  ฟังก์ชันดึงคำร้องโครงงานทั้งหมด (รวมอาจารย์ที่ปรึกษาและนักศึกษา)
exports.getAllRequests = async (req, res) => {
  try {
    const [results] = await db.query(
      `
      SELECT DISTINCT pr.request_id, pr.project_name, pr.project_name_eng,
        pr.status, pr.created_at, pr.student_id,
        u.username AS student_name, t.teacher_name
      FROM project_requests pr
      JOIN students_projects sp ON pr.request_id = sp.request_id
      JOIN users u ON pr.student_id = u.user_id
      LEFT JOIN teacher_info t ON pr.advisor_id = t.teacher_id
      ORDER BY pr.created_at DESC
      `
    );

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error(' Error fetching all project requests:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch requests.' });
  }
};

//  ฟังก์ชันอัปเดตสถานะคำร้องโครงงาน (`pending` → `approved` หรือ `rejected`)
exports.updateRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ success: false, message: 'Request ID and status are required.' });
  }

  try {
    // ดึงข้อมูลโครงงานและนักศึกษา
    const [project] = await db.query(
      `SELECT pr.project_name, u.email, u.username AS student_name
       FROM project_requests pr
       JOIN users u ON pr.student_id = u.user_id
       WHERE pr.request_id = ?`,
      [requestId]
    );

    if (!project.length) {
      return res.status(404).json({ success: false, error: 'Project request not found.' });
    }

    const { project_name, email, student_name } = project[0];

    // อัปเดตสถานะโครงงานในฐานข้อมูล
    const [result] = await db.query(
      `UPDATE project_requests SET status = ?, updated_at = NOW() WHERE request_id = ?`,
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Request not found.' });
    }

    let emailSubject, emailContent;

    if (status === 'approved') {
      emailSubject = '🎉 โครงงานของคุณได้รับการอนุมัติ!';
      emailContent = `
        <p>สวัสดีคุณ <strong>${student_name}</strong>,</p>
        <p>โครงงานของคุณ <strong>"${project_name}"</strong> ได้รับการอนุมัติแล้ว!</p>
        <p>คุณสามารถดำเนินการขั้นตอนถัดไปได้ที่ <a href="${process.env.FRONTEND_URL}/studentPage">ส่งเอกสารโครงงาน</a></p>
      `;
    } else if (status === 'rejected') {
      emailSubject = '⛔ โครงงานของคุณถูกปฏิเสธ';
      emailContent = `
        <p>สวัสดีคุณ <strong>${student_name}</strong>,</p>
        <p>โครงงานของคุณ <strong>"${project_name}"</strong> ถูกปฏิเสธ</p>
        <p>กรุณาติดต่ออาจารย์ที่ปรึกษาหรือแก้ไขข้อมูลและส่งคำร้องใหม่</p>
      `;
    }

    await sendEmail(email, emailSubject, emailContent);

    res.status(200).json({ success: true, message: 'Project status updated and email sent' });

  } catch (error) {
    console.error('❌ Error updating request status:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};

//  ฟังก์ชันลบคำร้องโครงงาน
exports.deleteRequest = async (req, res) => {
  const { requestId } = req.params;

  if (!requestId) {
    return res.status(400).json({ success: false, message: 'Request ID is required.' });
  }

  try {
    await db.query(`DELETE FROM students_projects WHERE request_id = ?`, [requestId]);
    const [result] = await db.query(`DELETE FROM project_requests WHERE request_id = ?`, [requestId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Request not found.' });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error(' Error deleting request:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete request.' });
  }
};
