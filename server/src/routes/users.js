const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateSession } = require('../middleware/authMiddleware');

// Fetch current user data
router.get('/me', authenticateSession, userController.getCurrentUser);

// Update user data
router.put('/:id', authenticateSession, userController.updateUser);

// Other routes
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;