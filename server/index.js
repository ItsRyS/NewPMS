require("dotenv").config();
const mysql = require('mysql2');
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const fs = require("fs");
// นำเข้า Routes
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");
const teacherRoutes = require("./src/routes/teacher");
const documentRoutes = require("./src/routes/document");
const userRoutes = require("./src/routes/users");
const projectRequestsRoutes = require("./src/routes/projectRequests");
const projectDocumentsRoutes = require("./src/routes/project_documents");

const app = express();
const PORT = process.env.PORT || 5000;

// การตั้งค่า CORS
app.use(
  cors({
    origin: "http://localhost:5173", // อนุญาตให้เรียก API จาก Frontend
    credentials: true, // เปิดใช้งาน Cookie
  })
);
const connectionPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync('./src/config/isrgrootx1.pem'), // Path ของไฟล์ certificate
  },
  connectTimeout: 10000, // 10 วินาที
});
// การตั้งค่า Session Store
const sessionStore = new MySQLStore({}, connectionPool);

app.use(
  session({
    key: "user_sid",
    secret: "itpms2024", // คีย์สำหรับเข้ารหัส Session
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // ใช้ MySQL เป็นที่เก็บ Session
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // อายุ Session 1 วัน
      secure: false, // เปิด true เมื่อใช้ HTTPS
      httpOnly: true, // ห้ามเข้าถึง Cookie ผ่าน JavaScript
    },
  })
);

// Middleware
app.use(express.json()); // แปลงคำขอ JSON เป็น Object
app.use(bodyParser.json()); // รองรับ JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // รองรับ URL-encoded bodies

// Static Files
app.use("/upload", express.static(path.join(__dirname, "upload"))); // ให้บริการไฟล์ในโฟลเดอร์ upload

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/project-requests", projectRequestsRoutes);
app.use("/api/document-types", projectDocumentsRoutes);
app.use("/api/project-documents", projectDocumentsRoutes);

// Test Endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Hello from server");
});

// Middleware เพื่อตรวจจับ Tab ID
app.use((req, res, next) => {
  const tabId = req.headers["x-tab-id"];
  if (tabId) {
    //console.log("Tab ID:", tabId);
  }
  next();
});
// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});
// Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err, req, res) => {
  console.error("Error stack:", err.stack); // แสดง Stack Error
  res
    .status(500)
    .json({ error: "An unexpected error occurred", details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
