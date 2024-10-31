const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Endpoint สำหรับดึงข้อมูลทั้งหมดจาก project_release
router.get("/", (req, res) => { // ใช้เส้นทาง "/projects" ใน router
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
