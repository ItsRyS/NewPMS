const bcrypt = require('bcrypt');
const db = require('../config/db');

// ฟังก์ชันเข้าสู่ระบบ
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [userResult] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = userResult[0];

    if (!user) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // ✅ บันทึก Session
    req.session.user = {
      user_id: user.user_id,
      role: user.role,
      username: user.username,
      profileImage: user.profile_image,
    };

    req.session.save((err) => {
      if (err) {
        console.error("❌ Session Save Error:", err);
        return res.status(500).json({ error: "Failed to create session" });
      }
      console.log("✅ Session Created:", req.session);
      res.status(200).json({
        message: "Login successful",
        user: req.session.user,
      });
    });

  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.register = async (req, res) => {
  try {
    // ตรวจสอบข้อมูล req.body ด้วย Zod
    const { username, email, password } = req.body;

    // ทำงาน logic ต่อเมื่อ parse ผ่านแล้ว
    // ตรวจสอบว่า email ซ้ำหรือไม่
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
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
    // ดัก Zod error
    if (error.name === 'ZodError') {
      const messages = error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ error: messages });
    }

    console.error('Failed to register user:', error.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

// ฟังก์ชันออกจากระบบ
exports.logout = (req, res) => {
  try {
    const { tabId } = req.body;

    if (req.session && req.session.tabs && req.session.tabs[tabId]) {
      delete req.session.tabs[tabId];
      res.status(200).json({ message: 'Logout successful', success: true });
    } else {
      res.status(400).json({ error: 'Invalid tabId', success: false });
    }
  } catch (error) {
    // ดัก Zod error
    if (error.name === 'ZodError') {
      const messages = error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ error: messages, success: false });
    }
    console.error('เกิดข้อผิดพลาดในการออกจากระบบ:', error.message);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', success: false });
  }
};

exports.checkSession = (req, res) => {
  console.log("🔍 Checking Session:", req.session);
  if (req.session && req.session.user) {
    req.session.touch(); // ✅ ต่ออายุ Session
    req.session.save(); // ✅ บันทึก Session ใหม่
    return res.status(200).json({ isAuthenticated: true, user: req.session.user });
  } else {
    return res.status(401).json({ isAuthenticated: false });
  }
};

exports.refreshSession = (req, res) => {
  console.log("🔄 Refreshing Session:", req.session);
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: "Session expired" });
  }
  req.session.touch();
  req.session.save();
  res.json({ success: true, message: "Session refreshed", user: req.session.user });
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