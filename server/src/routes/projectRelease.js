const express = require('express');
const router = express.Router();
const projectReleaseController = require('../controllers/projectReleaseController');

router.get('/pending', projectReleaseController.getPendingProjects);
router.put('/update-status/:projectId', projectReleaseController.updateProjectStatus);

module.exports = router;
