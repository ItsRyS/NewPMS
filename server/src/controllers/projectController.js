const db = require('../config/db');

// Update request status and move approved projects to project_release
exports.updateRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;

  if (!requestId || !status) {
    return res
      .status(400)
      .json({ success: false, message: 'Request ID and status are required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Update project request status
    const [result] = await connection.query(
      `UPDATE project_requests SET status = ?, updated_at = NOW() WHERE request_id = ?`,
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Request not found.' });
    }

    // Handle approved status: Move to project_release
    if (status === 'approved') {
      const [projectData] = await connection.query(
        `
        SELECT 
          pr.project_name AS project_name_th,
          pr.project_name_eng AS project_name_eng,
          pr.project_type,
          NOW() AS project_create_time,
          pr.advisor_id
        FROM project_requests pr
        WHERE pr.request_id = ?
        `,
        [requestId]
      );

      const project = projectData[0];
      const [insertResult] = await connection.query(
        `
        INSERT INTO project_release 
        (project_name_th, project_name_eng, project_type, project_status, project_create_time, advisor_id)
        VALUES (?, ?, ?, 'operate', ?, ?)
        `,
        [
          project.project_name_th,
          project.project_name_eng,
          project.project_type,
          project.project_create_time,
          project.advisor_id,
        ]
      );

      const newProjectId = insertResult.insertId;

      // Update students_projects to reference new project_id
      await connection.query(
        `UPDATE students_projects SET project_id = ? WHERE request_id = ?`,
        [newProjectId, requestId]
      );
    }

    // Handle rejected status: Remove from project_release
    if (status === 'rejected') {
      await connection.query(
        `DELETE FROM project_release WHERE project_id IN (
          SELECT project_id FROM students_projects WHERE request_id = ?
        )`,
        [requestId]
      );

      // Optionally clean up students_projects if needed
      await connection.query(
        `DELETE FROM students_projects WHERE request_id = ?`,
        [requestId]
      );
    }

    await connection.commit();
    res
      .status(200)
      .json({ success: true, message: 'Status updated successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating request status:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update status.' });
  } finally {
    connection.release();
  }
};

// Fetch approved and ongoing projects
exports.getApprovedProjects = async (req, res) => {
  try {
    const [projects] = await db.query(
      `
      SELECT 
          pr.project_id, 
          pr.project_name_th, 
          pr.project_name_eng, 
          pr.project_status, 
          pr.project_type, 
          pr.project_create_time, 
          pr.project_path, 
          ti.teacher_name AS project_advisor,
          GROUP_CONCAT(DISTINCT u.username SEPARATOR ', ') AS team_members
      FROM project_release pr
      LEFT JOIN students_projects sp ON pr.project_id = sp.project_id
      LEFT JOIN users u ON sp.student_id = u.user_id
      LEFT JOIN teacher_info ti ON pr.advisor_id = ti.teacher_id
      WHERE pr.project_status IN ('operate', 'success')
      GROUP BY pr.project_id
      ORDER BY pr.project_create_time DESC;
      `
    );

    if (projects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No projects found.' });
    }

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch projects.' });
  }
};
