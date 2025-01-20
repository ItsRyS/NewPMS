const express = require('express');
const router = express.Router();
const multer = require('multer');
const projectDocumentsController = require('../controllers/projectDocumentsController');

const storage = multer.diskStorage({
  destination: 'upload/project-documents',
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const uniqueSuffix = Date.now();
    const sanitizedName = originalName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('กรุณาอัพโหลดไฟล์ PDF เท่านั้น'), false);
    }
  },
});

// เส้นทางสำหรับการจัดการเอกสารโครงงาน
router.post('/upload', upload.single('file'), projectDocumentsController.uploadDocument);
router.get('/all', projectDocumentsController.getAllDocuments);
router.get('/types', projectDocumentsController.getDocumentTypes);
router.get('/history', projectDocumentsController.getDocumentHistory);

router.delete('/:documentId', projectDocumentsController.deleteDocument);
router.post('/:documentId/approve', projectDocumentsController.approveDocument); // เส้นทางสำหรับอนุมัติ
router.post('/:documentId/reject', projectDocumentsController.rejectDocument); // เส้นทางสำหรับปฏิเสธ
router.post('/:documentId/return', upload.single('file'), projectDocumentsController.returnDocument); // เส้นทางสำหรับคืนเอกสาร

router.post('/resubmit/:id', upload.single('file'), projectDocumentsController.resubmitDocument);
router.get('/types-with-status', projectDocumentsController.getDocumentTypesWithStatus);

module.exports = router;
