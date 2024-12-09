const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db"); // เชื่อมต่อกับฐานข้อมูล
const router = express.Router();
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
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

    // เก็บข้อมูลใน session
    req.session.user = {
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

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      res.status(500).json({ error: "Logout failed" });
    } else {
      res.clearCookie("user_sid");
      res.json({ message: "Logout successful" });
    }
  });
});


router.get("/check-session", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;