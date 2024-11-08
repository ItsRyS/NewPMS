const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ดึงข้อมูลอาจารย์ทั้งหมด
router.get("/", (req, res) => {
  const sql = "SELECT * FROM teacher_info";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// ดึงข้อมูลอาจารย์ตาม id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM teacher_info WHERE teacher_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.json(result[0]);
  });
});

module.exports = router;
