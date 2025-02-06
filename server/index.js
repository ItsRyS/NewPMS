require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

// ใช้ PORT จาก Heroku ถ้ามี หรือใช้ค่าเริ่มต้นที่ 4000
const PORT = process.env.PORT || 4000;

// ตรวจสอบ Environment
const ENV = process.env.NODE_ENV || "production";
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// ตรวจสอบว่าตัวแปรที่ต้องใช้ถูกต้องหรือไม่
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error("❌ Database configuration is missing! Please check environment variables.");
  process.exit(1); // ปิดโปรแกรมถ้าตั้งค่าไม่ถูกต้อง
}

// การตั้งค่า CORS
app.use(
  cors({
    origin: ENV === "development" ? "http://localhost:5173" : "https://your-production-url.com",
    credentials: true,
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
    secret: "itpms2024",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: ENV === "production",
      httpOnly: true,
    },
  })
);

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static Files
app.use('/upload', express.static(path.join(__dirname, 'upload'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.pdf') {
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

// Test Endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Hello from server");
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
  console.error("Error stack:", err.stack);
  res.status(500).json({ error: "An unexpected error occurred", details: err.message });
});

// Start Server (ใช้ 0.0.0.0 เพื่อให้รองรับทุกเครือข่าย)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running in ${ENV} mode on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received. Exiting...');
  process.exit(0);
});
