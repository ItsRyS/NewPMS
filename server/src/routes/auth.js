const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db"); // เชื่อมต่อกับฐานข้อมูล
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password, tabId } = req.body;

  if (!email || !password || !tabId) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    const [userResult] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
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

    res.json({
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

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .promise()
      .query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, "student"]
      );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});


router.post("/logout", (req, res) => {
  const { tabId } = req.body;

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    delete req.session.tabs[tabId]; // ลบ session ของ tabId นั้น

    // ตรวจสอบว่า session ถูกลบสำเร็จ
    if (!req.session.tabs[tabId]) {
      res.json({ message: "Logout successful", success: true });
    } else {
      res.status(500).json({ error: "Failed to delete session", success: false });
    }
  } else {
    res.status(400).json({ error: "Invalid tabId", success: false });
  }
});



router.get("/check-session", (req, res) => {
  const tabId = req.headers["x-tab-id"];

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
    res.json({ isAuthenticated: true, user: req.session.tabs[tabId] });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;
