const bcrypt = require('bcrypt');
const db = require('../config/db');

// ฟังก์ชันเข้าสู่ระบบ
exports.login = async (req, res) => {
  const { email, password, tabId } = req.body;

  if (!email || !password || !tabId) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    const [userResult] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    const user = userResult[0];

    if (!user) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // เก็บข้อมูลใน session โดยใช้ tabId เป็น key
    if (!req.session.tabs) req.session.tabs = {};
    req.session.tabs[tabId] = {
      user_id: user.user_id,
      role: user.role,
      username: user.username,
      profileImage: user.profile_image,
    };

    res.status(200).json({
      message: 'Login successful',
      user_id: user.user_id,
      role: user.role,
      username: user.username,
      profileImage: user.profile_image,
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

// ฟังก์ชันลงทะเบียน
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    // ตรวจสอบว่า email ซ้ำหรือไม่
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้ไปแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'student']
    );
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
    });
  } catch (error) {
    console.error('Failed to register user:', error.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

// ฟังก์ชันออกจากระบบ
exports.logout = (req, res) => {
  const { tabId } = req.body;

  if (!tabId) {
    return res.status(400).json({ error: 'Missing tabId', success: false });
  }

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    delete req.session.tabs[tabId];
    res.status(200).json({ message: 'Logout successful', success: true });
  } else {
    res.status(400).json({ error: 'Invalid tabId', success: false });
  }
};

// ฟังก์ชันตรวจสอบสถานะ Session
exports.checkSession = (req, res) => {
  const tabId = req.headers['x-tab-id'];

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    res
      .status(200)
      .json({ isAuthenticated: true,user: req.session.tabs[tabId]  });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
};
exports.refreshSession = (req, res) => {
  const tabId = req.headers['x-tab-id'];

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    req.session.touch(); // ต่ออายุ Session
    res.status(200).json({ success: true, message: 'Session refreshed' });
  } else {
    res.status(401).json({ success: false, message: 'Session expired' });
  }
};
// ฟังก์ชันอัปเดตเซสชัน
exports.updateSession = async (req, res) => {
  const { tabId, username, profileImage } = req.body;

  if (!tabId) {
    return res.status(400).json({ error: 'Missing tabId', success: false });
  }

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    // อัปเดตข้อมูลผู้ใช้ในเซสชัน
    if (username) req.session.tabs[tabId].username = username;
    if (profileImage) req.session.tabs[tabId].profileImage = profileImage;

    res.status(200).json({ success: true, message: 'Session updated successfully' });
  } else {
    res.status(400).json({ error: 'Invalid tabId', success: false });
  }
};