// index.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const db = require("./src/config/db");

const app = express();

const ENV = process.env.NODE_ENV || "development";
const PORT = ENV === "development" ? process.env.DEV_PORT : process.env.PROD_PORT;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://new-pms.vercel.app"
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // ✅ เปิดใช้งาน Credentials (สำคัญ)
  })
);

const sessionStore = new MySQLStore(db);

app.use(
  session({
    key: "user_sid",
    secret: "itpms2024",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 วัน
      secure: process.env.NODE_ENV === "production", // ✅ ต้องเป็น true ถ้าใช้งาน HTTPS
      httpOnly: false, // ✅ อนุญาตให้ JavaScript เข้าถึง cookie
      sameSite: "None", // ✅ สำคัญสำหรับ cross-site session
    },
  })
);


app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Static Files สำหรับอัปโหลด PDF และรูปภาพ
app.use(
  "/upload",
  express.static(path.join(__dirname, "upload"), {
    setHeaders: (res, filePath) => {
      if ([".pdf", ".jpg", ".png"].includes(path.extname(filePath))) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
    },
  })
);

// ✅ Import Routes
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");
const teacherRoutes = require("./src/routes/teacher");
const documentRoutes = require("./src/routes/document");
const userRoutes = require("./src/routes/users");
const projectRequestsRoutes = require("./src/routes/projectRequests");
const projectDocumentsRoutes = require("./src/routes/project_documents");
const projectReleaseRoutes = require("./src/routes/projectRelease");
const projectTypesRoutes = require("./src/routes/projectTypes");
const oldProjectsRoutes = require("./src/routes/oldProjects");

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/project-requests", projectRequestsRoutes);
app.use("/api/document-types", projectDocumentsRoutes);
app.use("/api/project-documents", projectDocumentsRoutes);
app.use("/api/project-release", projectReleaseRoutes);
app.use("/api/project-types", projectTypesRoutes);
app.use("/api/old-projects", oldProjectsRoutes);

// ✅ Test API
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// ✅ Root Endpoint
app.get("/", (req, res) => {
  res.send("Hello from server");
});

// ✅ Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

// ✅ Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ✅ Global Error Handler
app.use((err, req, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Unexpected error occurred", details: err.message });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
