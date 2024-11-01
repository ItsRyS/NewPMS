const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // เชื่อมต่อกับฐานข้อมูล
const authenticateToken = require('../middleware/authMiddleware'); // middleware ตรวจสอบ token

const router = express.Router();

// เส้นทางสำหรับการสมัครสมาชิก
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบหรือไม่
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน' });
  }

  try {
    const [existingUser] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'อีเมลนี้มีในระบบแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user']
    );

    const token = jwt.sign(
      { id: result.insertId, role: role || 'user' },
      process.env.JWT_SECRET || 'itPmsKey',
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', token, role: role || 'user' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสมัครสมาชิก:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// เส้นทางสำหรับ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  try {
    const [userResult] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const user = userResult[0];

    if (!user) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'itPmsKey',
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// เส้นทางที่ต้องการการตรวจสอบ token
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
