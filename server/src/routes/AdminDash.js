const express = require("express");
const router = express.Router();
const { getAdminDashboardData } = require("../controllers/AdminDashController");


router.get("/", getAdminDashboardData);

module.exports = router;
