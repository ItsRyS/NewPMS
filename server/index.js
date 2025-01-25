require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);


const app = express();

// Check current environment
const ENV = process.env.NODE_ENV || "development";
const PORT = ENV === "development" ? process.env.DEV_PORT : process.env.PROD_PORT;
const DB_HOST = ENV === "development" ? process.env.DEV_DB_HOST : process.env.PROD_DB_HOST;
const DB_PORT = ENV === "development" ? process.env.DEV_DB_PORT : process.env.PROD_DB_PORT;
const DB_USER = ENV === "development" ? process.env.DEV_DB_USER : process.env.PROD_DB_USER;
const DB_PASSWORD = ENV === "development" ? process.env.DEV_DB_PASSWORD : process.env.PROD_DB_PASSWORD;
const DB_NAME = ENV === "development" ? process.env.DEV_DB_NAME : process.env.PROD_DB_NAME;

// การตั้งค่า CORS
app.use(
  cors({
    origin: ENV === "development" ? "http://localhost:5173" : "https://your-production-url.com",
    credentials: true, // เปิดใช้งาน Cookie
  })
);

// การตั้งค่า Session Store
const sessionStore = new MySQLStore({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
});

app.use(
  session({
    key: "user_sid",
    secret: "itpms2024", // คีย์สำหรับเข้ารหัส Session
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // ใช้ MySQL เป็นที่เก็บ Session
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // อายุ Session 1 วัน
      secure: ENV === "production", // เปิด true เมื่อใช้ HTTPS
      httpOnly: true, // ห้ามเข้าถึง Cookie ผ่าน JavaScript
    },
  })
);

// Middleware
app.use(express.json()); // แปลงคำขอ JSON เป็น Object
app.use(bodyParser.json()); // รองรับ JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // รองรับ URL-encoded bodies

// Static Files
app.use('/upload', express.static(path.join(__dirname, 'upload'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.pdf') {
      //console.log(`Serving PDF: ${filePath}`);
      res.setHeader('Content-Disposition', 'inline');
    }
  },
}));





// นำเข้า Routes
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");
const teacherRoutes = require("./src/routes/teacher");
const documentRoutes = require("./src/routes/document");
const userRoutes = require("./src/routes/users");
const projectRequestsRoutes = require("./src/routes/projectRequests");
const projectDocumentsRoutes = require("./src/routes/project_documents");
const projectReleaseRoutes = require('./src/routes/projectRelease');
const projectTypesRoutes = require('./src/routes/projectTypes');
const studentsRoutes = require('./src/routes/students'); // เพิ่ม Routes สำหรับจัดการนักศึกษา
const { Server } = require("http");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/project-requests", projectRequestsRoutes);
app.use("/api/document-types", projectDocumentsRoutes);
app.use("/api/project-documents", projectDocumentsRoutes);
app.use("/api/project-release", projectReleaseRoutes);
app.use('/api/project-types', projectTypesRoutes);
app.use('/api/students', studentsRoutes); // เพิ่ม Routes สำหรับจัดการนักศึกษา

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
  res.status(500).json({ error: "An unexpected error occurred", details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`index.js  : ${ENV} Server on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Exiting...');
  Server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});