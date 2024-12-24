const express = require("express");
const router = express.Router();
const projectRequestsController = require("../controllers/projectRequestsController");

router.post("/create", projectRequestsController.createRequest);
router.get("/status", projectRequestsController.getStudentRequests);
router.get("/all", projectRequestsController.getAllRequests);
//router.post("/update-status", projectRequestsController.updateRequestStatus); ย้ายไป PUT /projects/update-status

module.exports = router;
