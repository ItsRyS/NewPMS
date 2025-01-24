const bcrypt = require('bcrypt');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, role || 'student']
    );
    res
      .status(201)
      .json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Update user data
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, password } = req.body;

  console.log('Request Payload:', { username, email, role, password }); // Log the payload

  if (!username || !email || !role) { // ตรวจสอบ role ด้วย
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        'UPDATE users SET username = ?, email = ?, role = ?, password = ? WHERE user_id = ?',
        [username, email, role, hashedPassword, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
    } else {
      const [result] = await db.query(
        'UPDATE users SET username = ?, email = ?, role = ? WHERE user_id = ?',
        [username, email, role, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Fetch current user data
exports.getCurrentUser = async (req, res) => {
  const userId = req.session.user.user_id; // Assuming the user ID is stored in the session
  try {
    const [results] = await db.query('SELECT * FROM users WHERE user_id = ?', [
      userId,
    ]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { user_id, username, email, role, profile_image } = results[0]; // Include profile_image in the response
    res.status(200).json({ id: user_id, username, email, role, profile_image }); // Return profile_image
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};


exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.session.user.user_id;
    const profileImage = req.file.path.replace(/\\/g, '/'); // Normalize path for cross-platform compatibility

    // Fetch old profile image from database
    const [user] = await db.query('SELECT profile_image FROM users WHERE user_id = ?', [userId]);
    const oldProfileImage = user[0]?.profile_image;

    // Construct full path to old profile image
    if (oldProfileImage) {
      const fullPath = path.join(__dirname, '..', '..', oldProfileImage); // Adjust path for server structure
      console.log('Full path to old profile image:', fullPath);

      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath); // Delete old file
          console.log('Deleted old profile image:', fullPath);
        } catch (err) {
          console.error('Error deleting old profile image:', err.message);
        }
      } else {
        console.log('File does not exist:', fullPath);
      }
    }

    // Update new profile image in database
    await db.query('UPDATE users SET profile_image = ? WHERE user_id = ?', [profileImage, userId]);

    // Update session
    req.session.user.profileImage = profileImage;

    res.status(200).json({ profileImage });
  } catch (error) {
    console.error('Error uploading profile image:', error.message);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
};
