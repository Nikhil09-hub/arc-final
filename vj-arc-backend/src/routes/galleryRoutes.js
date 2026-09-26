const express = require("express");

const {
  getGallery,
  createGalleryImage,
  updateGallerySectionOrder,
  updateGalleryImage,
  deleteGalleryImage,
} = require("../controllers/galleryController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public — anyone can view the gallery
router.get("/", getGallery);

// Protected — admin login required
router.post("/", protect, createGalleryImage);
router.put("/sections/order", protect, updateGallerySectionOrder);
router.put("/:id", protect, updateGalleryImage);
router.delete("/:id", protect, deleteGalleryImage);

module.exports = router;