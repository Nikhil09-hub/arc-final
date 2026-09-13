const express = require("express");

const {
  getGallery,
  createGalleryImage,
  deleteGalleryImage,
} = require("../controllers/galleryController");

const router = express.Router();

router.get("/", getGallery);

router.post("/", createGalleryImage);

router.delete("/:id", deleteGalleryImage);

module.exports = router;