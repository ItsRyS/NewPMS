const bcrypt = require('bcrypt');
const db = require('../config/db');

// Get all users
exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Failed to fetch users:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
};

// Create a new user
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'student'],
      (err, result) => {
        if (err) {
          console.error('Failed to insert user:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: result.insertId });
      }
    );
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, password } = req.body;

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query(
        'UPDATE users SET username = ?, email = ?, role = ?, password = ? WHERE user_id = ?',
        [username, email, role, hashedPassword, id],
        (err) => {
          if (err) {
            console.error('Failed to update user:', err);
            return res.status(500).json({ error: 'Failed to update user' });
          }
          res.json({ message: 'User updated successfully' });
        }
      );
    } else {
      db.query(
        'UPDATE users SET username = ?, email = ?, role = ? WHERE user_id = ?',
        [username, email, role, id],
        (err) => {
          if (err) {
            console.error('Failed to update user:', err);
            return res.status(500).json({ error: 'Failed to update user' });
          }
          res.json({ message: 'User updated successfully' });
        }
      );
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM users WHERE user_id = ?', [id], (err) => {
    if (err) {
      console.error('Failed to delete user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    res.json({ message: 'User deleted successfully' });
  });
};
