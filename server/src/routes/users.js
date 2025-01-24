const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateSession } = require('../middleware/authMiddleware');
const upload = require('../config/multer'); // Import Multer configuration

// Fetch current user data
router.get('/me', authenticateSession, userController.getCurrentUser);

// Update user data
router.put('/:id', authenticateSession, userController.updateUser);

// Upload profile picture
router.post(
  '/upload-profile-image',
  authenticateSession,
  upload.single('profileImage'),
  userController.uploadProfileImage
);

// Other routes
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
