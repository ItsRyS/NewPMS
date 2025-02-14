require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);



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
    credentials: true,
  })
);

const sessionStore = new MemoryStore({
  checkPeriod: 86400000, // ลบ session ที่หมดอายุทุก 24 ชั่วโมง
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.JWT_SECRET || "itPmsKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // อายุ 1 วัน
      secure: process.env.NODE_ENV === "production", // ✅ เปิด secure mode ใน Production เท่านั้น
      httpOnly: true, // ✅ อนุญาตให้ JavaScript เข้าถึง cookie
      sameSite: "None",
    },
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Unexpected error occurred", details: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
