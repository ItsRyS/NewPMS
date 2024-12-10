const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

// เส้นทางสำหรับจัดการข้อมูลอาจารย์
router.get("/:id", teacherController.getTeacherById);
router.post("/", teacherController.uploadMiddleware, teacherController.createTeacher);
router.put("/:id", teacherController.uploadMiddleware, teacherController.updateTeacher);
router.delete("/:id", teacherController.deleteTeacher);
router.get("/", teacherController.getAllTeachers);

module.exports = router;
