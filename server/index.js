require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
// Import Routes
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");
const teacherRoutes = require("./src/routes/teacher");
const documentRoutes = require("./src/routes/document");
const userRoutes = require("./src/routes/users");
const projectRequestsRoutes = require("./src/routes/projectRequests");
const projectDocumentsRoutes = require("./src/routes/project_documents");
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// การตั้งค่า session store
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.use(
  session({
    key: "user_sid",
    secret: "itpms2024",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // อายุ session (1 ชั่วโมง)
      secure: false, // true ใน production ที่ใช้ HTTPS
      httpOnly: true,
    },
  })
);

// Middleware to log Tab ID
app.use((req, res, next) => {
  const tabId = req.headers["x-tab-id"];
  if (tabId) {
    console.log("Tab ID:", tabId);
  }
  next();
});

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(bodyParser.json()); // Parse JSON bodies

// Static Files
app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use("/upload", express.static("upload")); // ให้บริการไฟล์ในโฟลเดอร์ upload

// API Routes
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);
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

// Handle 404 Not Found and Global Error Handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err) {
    console.error("Error stack:", err.stack); // Log error stack for debugging
    res
      .status(500)
      .json({ error: "An unexpected error occurred", details: err.message });
  } else {
    res.status(404).json({ error: "Endpoint not found" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
