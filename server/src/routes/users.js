const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadProfile } = require('../config/multer');
const { verifyToken } = require('../middleware/authMiddleware');

// Middleware to handle file size limit exceeded
const handleFileSizeError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size limit exceeded. Maximum size is 2MB'
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      details: err.message
    });
  }
  next();
};

// Update routes with better error handling
router.get('/me', verifyToken, userController.getCurrentUser);

router.put('/:id', verifyToken, userController.updateUser);

router.post(
  '/upload-profile-image',
  verifyToken,
  uploadProfile.single('profileImage'),
  handleFileSizeError,
  userController.uploadProfileImage
);

router.get('/', verifyToken, userController.getAllUsers);

router.post('/', verifyToken, userController.createUser);

router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;