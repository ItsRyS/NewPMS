// routes/projects.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
// Endpoint สำหรับดึงข้อมูลจาก project_release
router.get("/projects", (req, res) => {
  const query = "SELECT * FROM project_release";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching projects:", err);
      res.status(500).json({ error: "Failed to fetch projects" });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
