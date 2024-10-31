require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");

const app = express();
const PORT = process.env.PORT || 5000;

// ตั้งค่า CORS เพื่อให้รองรับการเชื่อมต่อจากแหล่งที่มาที่กำหนด (เช่น http://localhost:5173)
app.use(cors({
  origin: "http://localhost:5173", // URL ของไคลเอนต์ (ปรับให้ตรงกับ URL ของคุณ)
  credentials: true, // ให้รองรับการส่ง credentials (เช่น cookies) ข้ามโดเมน
}));

// Middleware เพื่อแปลงข้อมูล JSON จาก request body
app.use(express.json());
app.use(bodyParser.json());

// กำหนดเส้นทาง API สำหรับ projects และ auth
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
