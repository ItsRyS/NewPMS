const db = require("../config/db");

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
  const { teacher_name, teacher_phone, teacher_email, teacher_bio, teacher_expert, teacher_image } = req.body;
  if (!teacher_name || !teacher_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO teacher_info (teacher_name, teacher_phone, teacher_email, teacher_bio, teacher_expert, teacher_image) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [teacher_name, teacher_phone, teacher_email, teacher_bio, teacher_expert, teacher_image], (err, result) => {
    if (err) return res.status(500).json({ error: "Database insert failed" });
    res.status(201).json({ message: "Teacher created", teacherId: result.insertId });
  });
};

// อัปเดตข้อมูลอาจารย์
exports.updateTeacher = (req, res) => {
  const { id } = req.params;
  const { teacher_name, teacher_phone, teacher_email, teacher_bio, teacher_expert, teacher_image } = req.body;

  if (!teacher_name || !teacher_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    UPDATE teacher_info 
    SET teacher_name = ?, teacher_phone = ?, teacher_email = ?, teacher_bio = ?, teacher_expert = ?, teacher_image = ?
    WHERE teacher_id = ?
  `;

  db.query(sql, [teacher_name, teacher_phone, teacher_email, teacher_bio, teacher_expert, teacher_image, id], (err, result) => {
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
  db.query("DELETE FROM teacher_info WHERE teacher_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database delete failed" });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.json({ message: "Teacher deleted" });
  });
};
