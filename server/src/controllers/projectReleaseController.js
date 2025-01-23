const db = require('../config/db');

// ฟังก์ชันสำหรับดึง Complete Report
exports.getCompleteReport = async (req, res) => {
  const { projectId } = req.params;

  try {
    const [projectCheck] = await db.query(
      `SELECT pr.project_status,
              (SELECT pd.file_path
               FROM project_documents pd
               JOIN students_projects sp ON pd.request_id = sp.request_id
               WHERE sp.project_id = ? AND pd.type_id = 16 AND pd.status = 'approved') AS complete_report_path
       FROM project_release pr
       WHERE pr.project_id = ? AND pr.project_status = 'complete'`,
      [projectId, projectId]
    );

    if (projectCheck.length === 0 || !projectCheck[0].complete_report_path) {
      return res.status(404).json({
        success: false,
        message: 'Complete report not available or project not completed.'
      });
    }

    const documentPath = projectCheck[0].complete_report_path.replace(/\\/g, '/');
    const sanitizedPath = documentPath.startsWith('upload/project-documents/')
      ? documentPath.replace('upload/project-documents/', '')
      : documentPath;

    res.status(200).json({
      success: true,
      documentPath: `/upload/project-documents/${sanitizedPath}`
    });
  } catch (error) {
    console.error('Error fetching complete report:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch complete report.' });
  }
};


// ฟังก์ชันสำหรับดึงโครงการที่รอการอนุมัติ
exports.getPendingProjects = async (req, res) => {
  try {
    const [projects] = await db.query(
      `SELECT
        pr.project_id,
        pr.project_name_th,
        pr.project_name_eng,
        pr.project_type,
        pr.project_status,
        ti.teacher_name AS advisor_name
      FROM project_release pr
      LEFT JOIN teacher_info ti ON pr.advisor_id = ti.teacher_id
      WHERE pr.project_status = 'operate'`
    );

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching pending projects:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
};

// ฟังก์ชันสำหรับอัปเดตสถานะโครงการ
exports.updateProjectStatus = async (req, res) => {
  const { projectId } = req.params;

  try {
    // ตรวจสอบเอกสารที่ได้รับการอนุมัติแล้ว
    const [documentCheck] = await db.query(
      `SELECT COUNT(*) AS approved_count
       FROM project_documents pd
       JOIN students_projects sp ON pd.request_id = sp.request_id
       WHERE sp.project_id = ? AND pd.status = 'approved'`,
      [projectId]
    );

    const [documentTotal] = await db.query(
      `SELECT COUNT(*) AS total_count
       FROM document_types`
    );

    if (documentCheck[0].approved_count < documentTotal[0].total_count) {
      return res.status(400).json({
        success: false,
        message: 'Cannot release project. Ensure all documents are approved.',
      });
    }

    // อัปเดตสถานะโครงการเป็น "complete"
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

// ฟังก์ชันตรวจสอบเอกสารที่ยังไม่ได้รับการอนุมัติ
exports.checkProjectDocuments = async (req, res) => {
  const { projectId } = req.params;

  try {
    const [unapprovedDocuments] = await db.query(
      `SELECT dt.type_name
       FROM document_types dt
       LEFT JOIN project_documents pd
         ON dt.type_id = pd.type_id
         AND pd.request_id = (
           SELECT request_id
           FROM students_projects
           WHERE project_id = ?
           LIMIT 1
         )
       WHERE pd.status IS NULL OR pd.status != 'approved'`,
      [projectId]
    );

    res.status(200).json({ unapprovedDocuments });
  } catch (error) {
    console.error('Error checking project documents:', error.message);
    res.status(500).json({ success: false, message: 'Failed to check project documents.' });
  }
};
