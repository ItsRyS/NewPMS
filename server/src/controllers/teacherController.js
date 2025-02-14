const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const fs = require('fs');


const { uploadFileToSupabase } = require("../config/storage");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './upload/pic'); // เก็บในโฟลเดอร์ pic
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8'
    );
    const uniqueSuffix = Date.now();
    const sanitizedName = originalName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

const upload = multer({ storage });

exports.uploadMiddleware = upload.single('teacher_image');

// ดึงข้อมูลอาจารย์ทั้งหมด
exports.getAllTeachers = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM teacher_info');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};
// ดึงข้อมูลอาจารย์ตาม ID
exports.getTeacherById = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      'SELECT * FROM teacher_info WHERE teacher_id = ?',
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching teacher:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "❌ No file uploaded" });

    const fileUrl = await uploadFileToSupabase(req.file, "profile-images"); // อัปโหลดไปยัง Supabase

    const { teacher_name, teacher_phone, teacher_email, teacher_academic, teacher_expert } = req.body;

    const [result] = await db.query(
      `INSERT INTO teacher_info (teacher_name, teacher_phone, teacher_email, teacher_academic, teacher_expert, teacher_image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [teacher_name, teacher_phone, teacher_email, teacher_academic, teacher_expert, fileUrl]
    );

    res.status(201).json({ message: "✅ Teacher created successfully", teacherId: result.insertId, fileUrl });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ message: "❌ Failed to create teacher" });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_name, teacher_phone, teacher_email, teacher_academic, teacher_expert } = req.body;

    let fileUrl = req.body.teacher_image; // ถ้าไม่มีอัปโหลดใหม่ ให้ใช้รูปเดิม

    if (req.file) {
      fileUrl = await uploadFileToSupabase(req.file, "profile-images"); // อัปโหลดไปยัง Supabase
    }

    const [result] = await db.query(
      `UPDATE teacher_info
       SET teacher_name = ?, teacher_phone = ?, teacher_email = ?, teacher_academic = ?, teacher_expert = ?, teacher_image = ?
       WHERE teacher_id = ?`,
      [teacher_name, teacher_phone, teacher_email, teacher_academic, teacher_expert, fileUrl, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Teacher not found" });
    }

    res.status(200).json({ message: "✅ Teacher updated successfully", fileUrl });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "❌ Failed to update teacher" });
  }
};
// ลบข้อมูลอาจารย์
exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      `SELECT teacher_image FROM teacher_info WHERE teacher_id = ?`,
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const imagePath = path.join(
      __dirname,
      '../../upload/pic',
      results[0].teacher_image
    );
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await db.query(`DELETE FROM teacher_info WHERE teacher_id = ?`, [id]);
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};
