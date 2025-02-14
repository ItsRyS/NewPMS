const bcrypt = require('bcrypt');
const db = require('../config/db');
const { z } = require('zod');

// สร้าง Zod schema สำหรับ login


// สร้าง Zod schema สำหรับ register
const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// สร้าง Zod schema สำหรับ logout
const logoutSchema = z.object({
  tabId: z.string().nonempty('Missing tabId'),
});

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

    // ✅ บันทึกข้อมูล Session
    req.session.user = {
      user_id: user.user_id,
      role: user.role,
      username: user.username,
      profileImage: user.profile_image,
    };

    console.log("Session Created:", req.session); // 🛠 Debugging

    req.session.save((err) => {
      if (err) {
        console.error("Session Save Error:", err);
        return res.status(500).json({ error: "Session save failed" });
      }
      res.status(200).json({
        message: "Login successful",
        user: req.session.user,
      });
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





// ฟังก์ชันลงทะเบียน
exports.register = async (req, res) => {
  try {
    // ตรวจสอบข้อมูล req.body ด้วย Zod
    const { username, email, password } = registerSchema.parse(req.body);

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
    // ตรวจสอบข้อมูล req.body ด้วย Zod
    const { tabId } = logoutSchema.parse(req.body);

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

// ฟังก์ชันตรวจสอบสถานะ Session
exports.checkSession = (req, res) => {
  const tabId = req.headers["x-tab-id"];

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    res.status(200).json({ isAuthenticated: true, user: req.session.tabs[tabId] });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
};


// ฟังก์ชันต่ออายุ Session
exports.refreshSession = async (req, res) => {
  const tabId = req.headers["x-tab-id"];

  if (!req.session || !req.session.tabs || !req.session.tabs[tabId]) {
    return res.status(401).json({ success: false, message: "Session expired" });
  }

  try {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24; // ✅ ต่ออายุ Session
    req.session.save();

    res.json({ success: true, message: "Session refreshed", user: req.session.tabs[tabId] });
  } catch (error) {
    console.error("Error refreshing session:", error);
    res.status(500).json({ success: false, message: "Failed to refresh session" });
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