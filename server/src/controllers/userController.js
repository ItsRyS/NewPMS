const bcrypt = require('bcrypt');
const db = require('../config/db');
const path = require('path');
const supabase = require('../config/supabaseClient');
const fs = require('fs');
const sanitizeFilename = (filename) => {
  let cleanName = filename
    .normalize('NFC')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9ก-๙._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');

  return cleanName.length > 0 ? cleanName : 'file';
};
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
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const userId = req.user.user_id;
    const [results] = await db.query('SELECT * FROM users WHERE user_id = ?', [
      userId,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { user_id, username, email, role, profile_image } = results[0];
    res.status(200).json({ id: user_id, username, email, role, profile_image });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Update user data
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, password } = req.body;

  console.log('Request Payload:', { username, email, role, password }); 

  if (!username || !email || !role) {

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



exports.uploadProfileImage = async (req, res) => {
  try {

    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Only JPG, PNG  are allowed'
      });
    }

    const userId = req.user.user_id;
    const file = req.file;

    const fileExtension = path.extname(file.originalname);
    const baseFilename = path.basename(file.originalname, fileExtension);
    const sanitizedFilename = sanitizeFilename(baseFilename);
    const filePath = `profile-images/${userId}_${Date.now()}_${sanitizedFilename}${fileExtension}`;


    const fileBuffer = fs.readFileSync(file.path);


    const { error: uploadError } = await supabase.storage
      .from('upload')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      return res.status(500).json({
        error: 'Failed to upload profile image',
        details: uploadError.message
      });
    }

    const { data: urlData } = supabase.storage
      .from('upload')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return res.status(500).json({
        error: 'Failed to get public URL for uploaded image'
      });
    }

    const [oldImage] = await db.query(
      'SELECT profile_image FROM users WHERE user_id = ?',
      [userId]
    );

    if (oldImage[0]?.profile_image) {
      try {
        const oldPath = new URL(oldImage[0].profile_image).pathname.split('/').pop();
        await supabase.storage
          .from('upload')
          .remove([`profile-images/${oldPath}`]);
      } catch (error) {
        console.warn('Failed to delete old profile image:', error);
      }
    }

    const [result] = await db.query(
      'UPDATE users SET profile_image = ? WHERE user_id = ?',
      [urlData.publicUrl, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }


    fs.unlinkSync(file.path);

    res.status(200).json({
      message: 'Profile image updated successfully',
      profileImage: urlData.publicUrl
    });

  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({
      error: 'Failed to upload profile image',
      details: error.message
    });
  }
};


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
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
};
