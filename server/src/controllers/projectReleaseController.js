const db = require('../config/db');

exports.getCompleteReport = async (req, res) => {
  const { projectId } = req.params;

  try {
    const [projectCheck] = await db.query(
      `SELECT pr.project_status,
              (SELECT pd.file_path
               FROM project_documents pd
               JOIN students_projects sp ON pd.request_id = sp.request_id
               WHERE sp.project_id = ? AND pd.type_id = 16 AND pd.status = 'approved'
               ORDER BY pd.submitted_at DESC LIMIT 1) AS complete_report_path
       FROM project_release pr
       WHERE pr.project_id = ? AND pr.project_status = 'complete'`,
      [projectId, projectId]
    );

    if (!projectCheck.length || !projectCheck[0].complete_report_path) {
      return res.status(404).json({
        success: false,
        message: 'Complete report not available or project not completed.',
      });
    }

    let documentPath = projectCheck[0].complete_report_path;
    if (!documentPath.startsWith('https')) {
      documentPath = `${process.env.SUPABASE_URL}/storage/v1/object/public/${documentPath}`;
    }
    console.log('Generated Supabase URL:', documentPath);

    res.status(200).json({
      success: true,
      documentPath: documentPath,
    });
  } catch (error) {
    console.error('Error fetching complete report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complete report.',
    });
  }
};

// ฟังก์ชันตรวจสอบเอกสารที่ยังไม่ได้รับการอนุมัติ
exports.checkProjectDocuments = async (req, res) => {
  const { projectId } = req.params;

  try {
    //  แก้ไข Query ให้เลือกเฉพาะ request_id ล่าสุดของ projectId
    const [latestRequest] = await db.query(
      `SELECT request_id FROM students_projects WHERE project_id = ? ORDER BY request_id DESC LIMIT 1`,
      [projectId]
    );

    if (!latestRequest.length) {
      return res
        .status(404)
        .json({ success: false, message: 'No project request found.' });
    }

    const requestId = latestRequest[0].request_id;

    const [unapprovedDocuments] = await db.query(
      `SELECT dt.type_name, COALESCE(pd.status, 'missing') AS document_status
       FROM document_types dt
       LEFT JOIN project_documents pd
         ON dt.type_id = pd.type_id
         AND pd.request_id = ?
       WHERE pd.status IS NULL OR pd.status != 'approved'`,
      [requestId]
    );

    res.status(200).json({ unapprovedDocuments });
  } catch (error) {
    console.error('Error checking project documents:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to check project documents.' });
  }
};

// ฟังก์ชันสำหรับอัปเดตสถานะโครงการ (แก้ไขปัญหา HTTP 400 Bad Request)
exports.updateProjectStatus = async (req, res) => {
  const { projectId } = req.params;

  try {
    const [projectExist] = await db.query(
      'SELECT project_status FROM project_release WHERE project_id = ?',
      [projectId]
    );

    if (!projectExist.length) {
      return res
        .status(404)
        .json({ success: false, message: 'Project not found.' });
    }

    if (projectExist[0].project_status === 'complete') {
      return res
        .status(400)
        .json({ success: false, message: 'Project is already completed.' });
    }

    const [result] = await db.query(
      `SELECT
          (SELECT COUNT(*) FROM project_documents pd
           JOIN students_projects sp ON pd.request_id = sp.request_id
           WHERE sp.project_id = ? AND pd.status = 'approved') AS approved_count,
          (SELECT COUNT(*) FROM document_types) AS total_count
       FROM DUAL`,
      [projectId]
    );

    if (!result.length || result[0].approved_count === null) {
      return res.status(400).json({
        success: false,
        message: 'Cannot release project. Ensure all documents are approved.',
      });
    }

    if (result[0].approved_count < result[0].total_count) {
      return res.status(400).json({
        success: false,
        message: 'Cannot release project. Some required documents are missing.',
      });
    }

    const [updateResult] = await db.query(
      'UPDATE project_release SET project_status = "complete" WHERE project_id = ?',
      [projectId]
    );

    if (updateResult.affectedRows === 0) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to update project status.' });
    }

    res
      .status(200)
      .json({ success: true, message: 'Project released successfully.' });
  } catch (error) {
    console.error('Error releasing project:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to release project.' });
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
      WHERE pr.project_status = 'operate'
      ORDER BY pr.project_create_time DESC`
    );

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching pending projects:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch projects.' });
  }
};
