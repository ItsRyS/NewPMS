const express = require('express');
const router = express.Router();
const projectTypesController = require('../controllers/projectTypesController');

// CRUD สำหรับประเภทโครงงาน
router.post('/', projectTypesController.createProjectType);
router.get('/', projectTypesController.getAllProjectTypes);
router.put('/:project_type_id', projectTypesController.updateProjectType);
router.delete('/:project_type_id', projectTypesController.deleteProjectType);

module.exports = router;