require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");
const app = express();
const PORT = process.env.PORT || 5000;

// ตั้งค่า CORS ให้รองรับการเชื่อมต่อจาก frontend ที่ http://localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware เพื่อแปลงข้อมูล JSON จาก request body
app.use(express.json());
app.use(bodyParser.json());

// กำหนดเส้นทาง API สำหรับ projects และ auth
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);


// Endpoint ใหม่สำหรับทดสอบการเชื่อมต่อ API
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" }); // ส่ง JSON สำหรับทดสอบ
});

// Endpoint ที่ root path
app.get("/", (req, res) => {
  res.send("Hello from server"); // ส่งข้อความทดสอบ
});

// จัดการกรณีไม่พบ endpoint ที่ระบุ
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// จัดการข้อผิดพลาดทั้งหมด
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "An unexpected error occurred" });
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
