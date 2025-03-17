const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

//  ฟังก์ชันสร้าง JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
      username: user.username,
      profile_image: user.profile_image || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

//  ฟังก์ชันเข้าสู่ระบบ
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [userResult] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    const user = userResult[0];

    if (!user) return res.status(401).json({ error: 'ไม่พบผู้ใช้' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ error: 'รหัสไม่ถูกต้อง' });

    // สร้าง token
    const token = generateToken(user);

    // ตั้งค่า cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // ส่ง token กลับในทั้ง response body และ header
    res.setHeader('Authorization', `Bearer ${token}`);
    res.status(200).json({
      message: 'Login successful',
      role: user.role,
      token,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//  ฟังก์ชันสมัครสมาชิก
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้ไปแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'student']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

//  ฟังก์ชันออกจากระบบ (ลบ Cookie)
exports.logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None' });
  res.status(200).json({ message: 'Logout successful' });
};
