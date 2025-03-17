const express = require('express');
const router = express.Router();
const oldProjectsController = require('../controllers/oldProjectsController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() }); //  ใช้ memoryStorage() เพื่ออัปโหลดไฟล์ไปยัง Supabase

//  เส้นทาง API สำหรับโครงงานเก่า
router.get('/', oldProjectsController.getOldProjects);
router.post('/', upload.single('file'), oldProjectsController.addOldProject);
router.put('/:id', upload.single('file'), oldProjectsController.updateOldProject);
router.delete('/:id', oldProjectsController.deleteOldProject);

//  Middleware จัดการ Error
router.use((err, req, res) => {
  console.error('Old Project Route Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error processing old project request',
      status: err.status || 500,
    },
  });
});

module.exports = router;
