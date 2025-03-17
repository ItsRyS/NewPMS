const express = require('express');
const router = express.Router();
const multer = require('multer');
const projectDocumentsController = require('../controllers/projectDocumentsController');

const storage = multer.memoryStorage();

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
