const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');

// CRUD สำหรับนักศึกษา
router.post('/', studentsController.createStudent);
router.get('/', studentsController.getAllStudents); // เพิ่ม Route นี้
router.put('/:student_id', studentsController.updateStudent);
router.delete('/:student_id', studentsController.deleteStudent);

// อัพโหลดไฟล์ Excel
router.post('/upload', studentsController.uploadStudents);

module.exports = router;