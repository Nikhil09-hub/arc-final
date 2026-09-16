const express = require("express");

const {
  getGallery,
  createGalleryImage,
  deleteGalleryImage,
} = require("../controllers/galleryController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public — anyone can view the gallery
router.get("/", getGallery);

// Protected — admin login required
router.post("/", protect, createGalleryImage);
router.delete("/:id", protect, deleteGalleryImage);

module.exports = router;