const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Endpoint สำหรับดึงข้อมูลทั้งหมดจาก project_release
router.get("/", async (req, res) => {
  const query = "SELECT * FROM project_release";
  
  try {
    const [results] = await db.promise().query(query); // ใช้ promise เพื่อรองรับ async/await

    if (results.length === 0) {
      return res.status(404).json({ message: "No projects found" }); // กรณีไม่มีข้อมูล
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

module.exports = router;
