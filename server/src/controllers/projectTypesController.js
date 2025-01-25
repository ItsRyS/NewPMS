const db = require('../config/db');

// สร้างประเภทโครงงานใหม่
exports.createProjectType = async (req, res) => {
  const { project_type_name, project_type_description } = req.body;

  if (!project_type_name) {
    return res.status(400).json({ success: false, message: 'Project type name is required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO project_types (project_type_name, project_type_description) VALUES (?, ?)`,
      [project_type_name, project_type_description]
    );

    res.status(201).json({ success: true, project_type_id: result.insertId });
  } catch (error) {
    console.error('Error creating project type:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create project type.' });
  }
};

// ดึงประเภทโครงงานทั้งหมด
exports.getAllProjectTypes = async (req, res) => {
  try {
    const [results] = await db.query(`SELECT * FROM project_types`);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching project types:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch project types.' });
  }
};

// อัปเดตประเภทโครงงาน
exports.updateProjectType = async (req, res) => {
  const { project_type_id } = req.params;
  const { project_type_name, project_type_description } = req.body;

  if (!project_type_name) {
    return res.status(400).json({ success: false, message: 'Project type name is required.' });
  }

  try {
    const [result] = await db.query(
      `UPDATE project_types SET project_type_name = ?, project_type_description = ? WHERE project_type_id = ?`,
      [project_type_name, project_type_description, project_type_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Project type not found.' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating project type:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update project type.' });
  }
};

// ลบประเภทโครงงาน
exports.deleteProjectType = async (req, res) => {
  const { project_type_id } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM project_types WHERE project_type_id = ?`, [
      project_type_id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Project type not found.' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting project type:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete project type.' });
  }
};