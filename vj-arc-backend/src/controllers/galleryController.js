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
    const existingSection = await Gallery.findOne({ eventName: req.body.eventName }).select("sectionOrder");
    const lastSection = existingSection
      ? null
      : await Gallery.findOne().sort({ sectionOrder: -1 }).select("sectionOrder");
    const image = await Gallery.create({
      ...req.body,
      sectionOrder: existingSection?.sectionOrder ?? (lastSection?.sectionOrder ?? -1) + 1,
    });

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

const updateGallerySectionOrder = async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections) || sections.some((name) => typeof name !== "string" || !name.trim()) || new Set(sections).size !== sections.length) {
      return res.status(400).json({
        success: false,
        message: "Provide a unique list of gallery section titles",
      });
    }

    await Promise.all(sections.map((eventName, sectionOrder) =>
      Gallery.updateMany({ eventName }, { $set: { sectionOrder } })
    ));

    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateGalleryImage = async (req, res) => {
  try {
    const { eventName, category, caption } = req.body;
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      { eventName, category, caption },
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(400).json({
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
  updateGallerySectionOrder,
  updateGalleryImage,
  deleteGalleryImage,
};