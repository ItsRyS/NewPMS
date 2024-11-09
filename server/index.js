require("dotenv").config();
const express = require("express");
const path = require("path"); // เพิ่ม path ที่นี่
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");
const teacherRoutes = require("./src/routes/teacher");
const documentRoutes = require("./src/routes/document");

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

// เส้นทาง static สำหรับโฟลเดอร์ upload
app.use("/upload", express.static(path.join(__dirname, "upload")));

// กำหนดเส้นทาง API สำหรับ projects, auth และ document
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/document", documentRoutes);

// Endpoint ใหม่สำหรับทดสอบการเชื่อมต่อ API
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Endpoint ที่ root path
app.get("/", (req, res) => {
  res.send("Hello from server");
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
