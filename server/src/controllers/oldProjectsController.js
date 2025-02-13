const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { uploadOldProject } = require('../config/multer');

exports.uploadFile = uploadOldProject.single('file');

exports.addOldProject = async (req, res) => {
  const { old_project_name_th, old_project_name_eng, project_type, document_year } = req.body;

  // ตรวจสอบว่ามีไฟล์หรือไม่
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }

  const filePath = `upload/old_projects/${req.file.filename}`;

  try {
    const query = `
      INSERT INTO old_projects (old_project_name_th, old_project_name_eng, project_type, document_year, file_path)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [old_project_name_th, old_project_name_eng, project_type, document_year, filePath];

    await db.execute(query, values);
    res.status(201).json({ message: 'Old project added successfully', filePath });
  } catch (error) {
    console.error('Error inserting project:', error);
    res.status(500).json({ message: 'Database error' });
  }
};

// 📌 ดึงข้อมูลโครงงานเก่าทั้งหมด
exports.getOldProjects = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM old_projects ORDER BY document_year DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Database error' });
  }
};

// 📌 อัปเดตข้อมูลโครงงานเก่า (รองรับการเปลี่ยนไฟล์ใหม่)
exports.updateOldProject = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  let filePath = null;

  if (req.file) {
    filePath = `upload/old_projects/${req.file.filename}`;
  }

  try {
    const [existingProject] = await db.execute('SELECT file_path FROM old_projects WHERE old_id = ?', [id]);

    if (existingProject.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const oldFilePath = existingProject[0].file_path;

    // ตรวจสอบว่ามีไฟล์ใหม่ถูกอัปโหลดหรือไม่
    if (req.file) {
      filePath = `upload/old_projects/${req.file.filename}`;

      // ลบไฟล์ PDF เก่า (ถ้ามี)
      if (oldFilePath && fs.existsSync(path.join(__dirname, '..', '..', oldFilePath))) {
        fs.unlinkSync(path.join(__dirname, '..', '..', oldFilePath));
      }
    }
    const fields = [];
    const values = [];

    if (updateData.old_project_name_th !== undefined && updateData.old_project_name_th !== '') {
      fields.push('old_project_name_th = ?');
      values.push(updateData.old_project_name_th);
    }
    if (updateData.old_project_name_eng !== undefined && updateData.old_project_name_eng !== '') {
      fields.push('old_project_name_eng = ?');
      values.push(updateData.old_project_name_eng);
    }
    if (updateData.project_type !== undefined && updateData.project_type !== '') {
      fields.push('project_type = ?');
      values.push(updateData.project_type);
    }
    if (updateData.document_year !== undefined && updateData.document_year !== '') {
      fields.push('document_year = ?');
      values.push(updateData.document_year);
    }
    if (filePath) {
      fields.push('file_path = ?');
      values.push(filePath);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const query = `UPDATE old_projects SET ${fields.join(', ')} WHERE old_id = ?`;
    values.push(id);

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Database error' });
  }
};

// 📌 อัปเดตข้อมูลโครงงานเก่า (แก้ไขบางฟิลด์)
exports.patchOldProject = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  let query = `UPDATE old_projects SET `;
  const values = [];
  const fields = [];

  try {
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    query += fields.join(', ') + ` WHERE old_id = ?`;
    values.push(id);

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Database error' });
  }
};

// 📌 ลบโครงงานเก่า
exports.deleteOldProject = async (req, res) => {
  const { id } = req.params;

  try {
    const [existingProject] = await db.execute('SELECT file_path FROM old_projects WHERE old_id = ?', [id]);

    if (existingProject.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const filePath = existingProject[0].file_path;

    // ลบข้อมูลโครงงานจากฐานข้อมูล
    const query = `DELETE FROM old_projects WHERE old_id = ?`;
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // ลบไฟล์ PDF ถ้ามี
    if (filePath && fs.existsSync(path.join(__dirname, '..', '..', filePath))) {
      fs.unlinkSync(path.join(__dirname, '..', '..', filePath));
    }

    res.json({ message: 'Project and file deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Database error' });
  }
};
