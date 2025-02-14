require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);



const app = express();

const ENV = process.env.NODE_ENV || "development";
const PORT = ENV === "development" ? process.env.DEV_PORT : process.env.PROD_PORT;

app.use(
  cors({
    origin: ["https://new-pms.vercel.app"],
    credentials: true, // ✅ ต้องใช้ true เพื่อให้เบราว์เซอร์ส่ง Cookie กลับไป
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000, // ลบเซสชันที่หมดอายุทุก 15 นาที
  expiration: 86400000, // อายุเซสชัน 1 วัน
  createDatabaseTable: true,
  connectionLimit: 10,
  host: process.env.PROD_DB_HOST,
  user: process.env.PROD_DB_USER,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME,
  port: process.env.PROD_DB_PORT,
});

app.use(
  session({
    key: "user_sid",
    secret: process.env.JWT_SECRET || "itPmsKey",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      httpOnly: true,
      secure: true, // สำคัญ: ต้องใช้ `true` เพราะ production ใช้ HTTPS
      sameSite: "None", // สำคัญ: ต้องเป็น None เพื่อให้ Cookie ส่งข้ามโดเมนได้
      maxAge: 24 * 60 * 60 * 1000, // 1 วัน
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
