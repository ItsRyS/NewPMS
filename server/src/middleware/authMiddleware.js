// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // ดึง token จาก header ของคำขอ
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // ถ้าไม่มี token ส่งสถานะ 401 (Unauthorized)
  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  // ตรวจสอบและยืนยัน token
  jwt.verify(token, process.env.JWT_SECRET || 'itPmsKey', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    // เก็บข้อมูล user ที่ถูก decode จาก token ไว้ใน req.user
    req.user = user;
    next(); // ไปยังขั้นตอนถัดไป
  });
};

module.exports = authenticateToken;
