const Gallery = require("../models/Gallery");

const getGallery = async (req, res) => {
  try {
    const { category } = req.query;

    const filter =
      category && category !== "all"
        ? { category }
        : {};

    const images = await Gallery.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.create(req.body);

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery image deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getGallery,
  createGalleryImage,
  deleteGalleryImage,
};