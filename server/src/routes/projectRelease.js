const express = require('express');
const router = express.Router();
const projectReleaseController = require('../controllers/projectReleaseController');

// Routes
router.get('/pending', projectReleaseController.getPendingProjects);
router.put('/update-status/:projectId', projectReleaseController.updateProjectStatus);
router.get('/check-documents/:projectId', projectReleaseController.checkProjectDocuments);
router.get('/complete-report/:projectId', projectReleaseController.getCompleteReport);

module.exports = router;
