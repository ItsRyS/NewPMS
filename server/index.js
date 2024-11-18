require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import Routes
const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");
const teacherRoutes = require("./src/routes/teacher");
const documentRoutes = require("./src/routes/document");
const userRoutes = require("./src/routes/users");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(bodyParser.json()); // Parse JSON bodies

// Static Files
app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use('/upload', express.static('upload')); // ให้บริการไฟล์ในโฟลเดอร์ upload
// API Routes
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/users", userRoutes);

// Test Endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Hello from server");
});

// Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack); // Log error stack for debugging
  res.status(500).json({ error: "An unexpected error occurred", details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
