require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");

const app = express();
const PORT = process.env.PORT || 5000;

// ตั้งค่า CORS เพื่อให้รองรับการเชื่อมต่อจาก frontend ที่ http://localhost:5173
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Middleware เพื่อแปลงข้อมูล JSON จาก request body
app.use(express.json());
app.use(bodyParser.json());

// กำหนดเส้นทาง API สำหรับ projects และ auth
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);

// เพิ่ม endpoint ทดสอบที่ root path
app.get("/", (req, res) => {
  res.send("Hello from server"); // ส่งข้อความทดสอบ
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
