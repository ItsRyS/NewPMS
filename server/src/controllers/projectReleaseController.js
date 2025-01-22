const db = require('../config/db');

exports.getPendingProjects = async (req, res) => {
  try {
    const [projects] = await db.query(
      `
      SELECT
        pr.project_id,
        pr.project_name_th,
        pr.project_name_eng,
        pr.project_type,
        pr.project_status,
        ti.teacher_name AS advisor_name
      FROM project_release pr
      LEFT JOIN teacher_info ti ON pr.advisor_id = ti.teacher_id
      WHERE pr.project_status = 'operate'
      `
    );
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching pending projects:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
};

exports.updateProjectStatus = async (req, res) => {
  const { projectId } = req.params;

  try {
    // ตรวจสอบว่าเอกสารของโครงงานนี้ครบ 16 รายการ และได้รับการอนุมัติทั้งหมด
    const [documentCheck] = await db.query(
      `
      SELECT
        COUNT(*) AS approved_count
      FROM project_documents pd
      JOIN document_types dt ON pd.type_id = dt.type_id
      WHERE pd.request_id = (
        SELECT request_id FROM students_projects WHERE project_id = ?
      )
      AND pd.status = 'approved'
      `,
      [projectId]
    );

    const [documentTotal] = await db.query(
      `
      SELECT COUNT(*) AS total_count
      FROM document_types
      `
    );

    if (documentCheck[0].approved_count < documentTotal[0].total_count) {
      return res.status(400).json({
        success: false,
        message: 'Cannot release project. Ensure all 16 documents are submitted and approved.',
      });
    }

    // อัปเดตสถานะโครงงานเป็น "complete"
    const [result] = await db.query(
      'UPDATE project_release SET project_status = "complete" WHERE project_id = ?',
      [projectId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.status(200).json({ success: true, message: 'Project released successfully.' });
  } catch (error) {
    console.error('Error releasing project:', error.message);
    res.status(500).json({ success: false, message: 'Failed to release project.' });
  }
};
