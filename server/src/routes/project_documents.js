const express = require("express");
const router = express.Router();
const multer = require("multer");
const projectDocumentsController = require("../controllers/projectDocumentsController");

const storage = multer.diskStorage({
  destination: "upload/project-documents",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), projectDocumentsController.uploadDocument);
router.get("/all", projectDocumentsController.getAllDocuments);
router.delete("/delete/:documentId", projectDocumentsController.deleteDocument);
router.post("/approve/:id", projectDocumentsController.approveDocument);
router.post("/reject/:id", projectDocumentsController.rejectDocument);

module.exports = router;
