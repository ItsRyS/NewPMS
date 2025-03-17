const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);
router.get("/check-session", verifyToken, (req, res) => {
  res.status(200).json({ isAuthenticated: true, user: req.user });
});
router.post('/update-session', verifyToken, async (req, res) => {
  try {
    const { username, profileImage } = req.body;

    if (!username || !profileImage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    req.user.username = username;
    req.user.profileImage = profileImage;

    res.status(200).json({ message: 'Session updated successfully', user: req.user });
  } catch (error) {
    console.error('Error updating session:', error.message);
    res.status(500).json({ error: 'Failed to update session' });
  }
});


module.exports = router;
