const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
// Endpoint สำหรับดึงข้อมูลโครงงานที่อนุมัติแล้วหรือกำลังดำเนินการ
router.get("/", projectController.getApprovedProjects);

module.exports = router;