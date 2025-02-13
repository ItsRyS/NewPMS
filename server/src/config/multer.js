const multer = require('multer');
const path = require('path');

// ตั้งค่าอัปโหลดไฟล์เอกสารโครงงานเก่า
const oldProjectsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/old_projects/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `${uniqueSuffix}`);
  }
});

const uploadOldProject = multer({ storage: oldProjectsStorage });

// ตั้งค่าอัปโหลดรูปภาพโปรไฟล์
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/profile-images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF) are allowed'), false);
  }
};

// ตั้งค่าการอัปโหลดรูปภาพโปรไฟล์
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

// **แก้ไขการ export**
module.exports = {
  uploadOldProject,
  uploadProfile
};
