const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Error wrapper function
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes with error handling
router.get('/:id', asyncHandler(teacherController.getTeacherById));
router.post(
  '/',
  teacherController.uploadMiddleware,
  asyncHandler(teacherController.createTeacher)
);
router.put(
  '/:id',
  teacherController.uploadMiddleware,
  asyncHandler(teacherController.updateTeacher)
);
router.delete('/:id', asyncHandler(teacherController.deleteTeacher));
router.get('/', asyncHandler(teacherController.getAllTeachers));

// Add error handler specific to teacher routes
router.use((err, req, res) => {
  console.error('Teacher Route Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error processing teacher request',
      status: err.status || 500
    }
  });
});

module.exports = router;