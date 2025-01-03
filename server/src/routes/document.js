const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const documentController = require("../controllers/documentController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/Document");
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    const uniqueSuffix = Date.now();
    const sanitizedName = originalName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");
    cb(null, `${uniqueSuffix}_${sanitizedName}`);
  },
});

const upload = multer({ storage });

// Routes
router.post(
  "/upload",
  upload.single("file"),
  documentController.uploadDocument
);
router.get("/", documentController.getDocuments);
router.delete("/:id", documentController.deleteDocument);

module.exports = router;
