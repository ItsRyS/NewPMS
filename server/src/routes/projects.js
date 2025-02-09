const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');


// Endpoint for updating request status
router.put('/update-status', projectController.updateRequestStatus);

// Endpoint for fetching approved and ongoing projects
router.get('/', projectController.getApprovedProjects);
router.get('/project-types', projectController.getProjectTypes);

router.post("/upload-old", projectController.upload.single("file"), projectController.uploadOldProject);
router.get("/project-types", projectController.getProjectTypes);
router.get("/advisors", projectController.getAdvisors);
module.exports = router;
