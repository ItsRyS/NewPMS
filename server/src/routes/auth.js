const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db"); // เชื่อมต่อกับฐานข้อมูล
const router = express.Router();

// เข้าสู่ระบบ
router.post("/login", async (req, res) => {
  const { email, password, tabId } = req.body;

  if (!email || !password || !tabId) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    const [userResult] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = userResult[0];

    if (!user) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // เก็บข้อมูลใน session โดยใช้ tabId เป็น key
    if (!req.session.tabs) req.session.tabs = {};
    req.session.tabs[tabId] = {
      user_id: user.user_id,
      role: user.role,
      username: user.username,
    };
    //console.log("Session tabs after login:", req.session.tabs);
    res.status(200).json({
      message: "Login successful",
      user_id: user.user_id,
      role: user.role,
      username: user.username,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});

// ลงทะเบียนผู้ใช้ใหม่
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    // ตรวจสอบว่า email ซ้ำหรือไม่
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "อีเมลนี้ถูกใช้ไปแล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, "student"]
    );
    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});

// ออกจากระบบ
router.post("/logout", (req, res) => {
  const { tabId } = req.body;

  console.log("Tab ID from request body:", tabId);
  console.log("Current session tabs:", req.session?.tabs);

  if (!tabId) {
    console.error("Missing tabId in request");
    return res.status(400).json({ error: "Missing tabId", success: false });
  }

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    delete req.session.tabs[tabId];
    console.log("Tab session deleted for tabId:", tabId);
    res.status(200).json({ message: "Logout successful", success: true });
  } else {
    console.error("Invalid tabId or session not found");
    res.status(400).json({ error: "Invalid tabId", success: false });
  }
});




// ตรวจสอบสถานะ Session
router.get("/check-session", (req, res) => {
  const tabId = req.headers["x-tab-id"];

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    res.status(200).json({ isAuthenticated: true, user: req.session.tabs[tabId] });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;
