const express = require('express');
const { addOldProject, getOldProjects, updateOldProject, patchOldProject, deleteOldProject, uploadFile } = require('../controllers/oldProjectsController');

const router = express.Router();

// 📌 API เพิ่มโครงงานเก่า (รองรับการอัปโหลดไฟล์)
router.post('/', uploadFile, addOldProject);

// 📌 API ดึงข้อมูลโครงงานเก่าทั้งหมด
router.get('/', getOldProjects);

// 📌 API อัปเดตโครงงาน (รองรับไฟล์ใหม่)
router.put('/:id', uploadFile, updateOldProject);

// 📌 API แก้ไขบางฟิลด์
router.patch('/:id', patchOldProject);

// 📌 API ลบโครงงานเก่า
router.delete('/:id', deleteOldProject);

module.exports = router;
