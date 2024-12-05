const multer = require('multer');
const path = require('path');
const db = require("../config/db");
const fs = require('fs');

// ตั้งค่า Storage และ Path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './upload/pic'); // เก็บรูปภาพในโฟลเดอร์ pic ภายใต้ upload
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ใช้ timestamp + นามสกุลไฟล์
  }
});

const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single('teacher_image');

// ดึงข้อมูลอาจารย์ทั้งหมด
exports.getAllTeachers = (req, res) => {
  db.query("SELECT * FROM teacher_info", (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
};

// ดึงข้อมูลอาจารย์ตาม ID
exports.getTeacherById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM teacher_info WHERE teacher_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    if (result.length === 0) return res.status(404).json({ error: "Teacher not found" });
    res.json(result[0]);
  });
};

// สร้างข้อมูลอาจารย์ใหม่
exports.createTeacher = (req, res) => {
  const { teacher_name, teacher_phone, teacher_email, teacher_position, teacher_expert } = req.body;
  const teacher_image = req.file ? req.file.filename : null;

  if (!teacher_name || !teacher_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO teacher_info (teacher_name, teacher_phone, teacher_email, teacher_position, teacher_expert, teacher_image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [teacher_name, teacher_phone, teacher_email, teacher_position, teacher_expert, teacher_image], (err, result) => {
    if (err) return res.status(500).json({ error: "Database insert failed" });
    res.status(201).json({ message: "Teacher created", teacherId: result.insertId });
  });
};

// อัปเดตข้อมูลอาจารย์
exports.updateTeacher = (req, res) => {
  const { id } = req.params;
  const { teacher_name, teacher_phone, teacher_email, teacher_position, teacher_expert } = req.body;
  let teacher_image = req.file ? req.file.filename : req.body.teacher_image;

  if (!teacher_name || !teacher_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // หากไม่มีการอัปโหลดรูปภาพและไม่มีค่าภายในฐานข้อมูล
  if (!teacher_image) {
    teacher_image = null; // ปล่อยให้เป็นค่า NULL ได้
  }

  const sql = `
    UPDATE teacher_info 
    SET teacher_name = ?, teacher_phone = ?, teacher_email = ?, teacher_position = ?, teacher_expert = ?, teacher_image = ?
    WHERE teacher_id = ?
  `;

  db.query(sql, [teacher_name, teacher_phone, teacher_email, teacher_position, teacher_expert, teacher_image, id], (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Database update failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({ message: "Teacher updated successfully" });
  });
};

// ลบข้อมูลอาจารย์
exports.deleteTeacher = (req, res) => {
  const { id } = req.params;

  // ค้นหาไฟล์รูปภาพในฐานข้อมูล
  const findImageQuery = 'SELECT teacher_image FROM teacher_info WHERE teacher_id = ?';
  db.query(findImageQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (results.length > 0 && results[0].teacher_image) {
      // ชี้ไปที่ตำแหน่งไฟล์จริง
      const imagePath = path.join(__dirname, '../../upload/pic', results[0].teacher_image);

      // ตรวจสอบไฟล์ก่อนลบ
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Failed to delete image:', unlinkErr);
          } else {
            console.log('Image deleted successfully:', imagePath);
          }
        });
      } else {
        console.warn('Image file not found, skipping deletion:', imagePath);
      }
    }

    // ลบข้อมูลอาจารย์จากฐานข้อมูล
    const deleteQuery = 'DELETE FROM teacher_info WHERE teacher_id = ?';
    db.query(deleteQuery, [id], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: 'Failed to delete teacher' });
      }

      res.json({ message: 'Teacher deleted successfully' });
    });
  });
};
