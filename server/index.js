require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

// ตรวจสอบ Environment
const ENV = process.env.NODE_ENV || "development";
const PORT = ENV === "development" ? process.env.DEV_PORT : process.env.PROD_PORT;
const DB_HOST = ENV === "development" ? process.env.DEV_DB_HOST : process.env.PROD_DB_HOST;
const DB_PORT = ENV === "development" ? process.env.DEV_DB_PORT : process.env.PROD_DB_PORT;
const DB_USER = ENV === "development" ? process.env.DEV_DB_USER : process.env.PROD_DB_USER;
const DB_PASSWORD = ENV === "development" ? process.env.DEV_DB_PASSWORD : process.env.PROD_DB_PASSWORD;
const DB_NAME = ENV === "development" ? process.env.DEV_DB_NAME : process.env.PROD_DB_NAME;

// CORS Configuration
app.use(
  cors({
    origin: ENV === "development" ? "http://localhost:5173" : "https://itnewpms.vercel.app",
    credentials: true, // ใช้ cookies ข้าม origin
  })
);

// Session Store Configuration
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
      maxAge: 1000 * 60 * 60 * 24, // อายุ 1 วัน
      secure: ENV === "production",
      httpOnly: true,
    },
  })
);

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static Files สำหรับอัปโหลด PDF และรูปภาพ
app.use('/upload', express.static(path.join(__dirname, 'upload'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.pdf') {
      res.setHeader('Content-Disposition', 'inline');
    }
  },
}));

// Import Routes
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

// Test API
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Hello from server");
});

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

// Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err, req, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Unexpected error occurred", details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`index.js  : ${ENV} Server running on http://localhost:${PORT}`);
});
