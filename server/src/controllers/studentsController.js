const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../config/db');

// ตั้งค่า multer สำหรับอัพโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/'); // กำหนดโฟลเดอร์สำหรับเก็บไฟล์ที่อัพโหลด
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // ตั้งชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำ
  },
});

const upload = multer({ storage }); // ใช้ storage ที่ตั้งค่าไว้

// อัพโหลดไฟล์ Excel และนำเข้าข้อมูล
exports.uploadStudents = async (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      // ตรวจสอบรูปแบบข้อมูล
      if (!data[0] || !data[0]['รหัสนักศึกษา'] || !data[0]['ชื่อ'] || !data[0]['สกุล']) {
        return res.status(400).json({ success: false, message: 'Invalid file format.' });
      }

      // นำเข้าข้อมูลลงในฐานข้อมูล
      for (const row of data) {
        const student_code = row['รหัสนักศึกษา'];
        const student_name = `${row['ชื่อ']} ${row['สกุล']}`;

        await db.query(
          `INSERT INTO students (student_name, student_code) VALUES (?, ?)`,
          [student_name, student_code]
        );
      }

      res.status(200).json({ success: true, message: 'Students imported successfully.' });
    } catch (error) {
      console.error('Error importing students:', error.message);
      res.status(500).json({ success: false, error: 'Failed to import students.' });
    }
  });
};

// เพิ่มนักศึกษาใหม่
exports.createStudent = async (req, res) => {
  const { student_name, student_code, email } = req.body;

  if (!student_name || !student_code) {
    return res.status(400).json({ success: false, message: 'Student name and code are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO students (student_name, student_code, email) VALUES (?, ?, ?)`,
      [student_name, student_code, email]
    );

    res.status(201).json({ success: true, student_id: result.insertId });
  } catch (error) {
    console.error('Error creating student:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create student.' });
  }
};

// ดึงรายชื่อนักศึกษาทั้งหมด
exports.getAllStudents = async (req, res) => {
  try {
    const [results] = await db.query(`SELECT * FROM students`);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch students.' });
  }
};

// อัปเดตข้อมูลนักศึกษา
exports.updateStudent = async (req, res) => {
  const { student_id } = req.params;
  const { student_name, student_code, email } = req.body;

  if (!student_name || !student_code) {
    return res.status(400).json({ success: false, message: 'Student name and code are required.' });
  }

  try {
    const [result] = await db.query(
      `UPDATE students SET student_name = ?, student_code = ?, email = ? WHERE student_id = ?`,
      [student_name, student_code, email, student_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating student:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update student.' });
  }
};

// ลบนักศึกษา
exports.deleteStudent = async (req, res) => {
  const { student_id } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM students WHERE student_id = ?`, [student_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete student.' });
  }
};