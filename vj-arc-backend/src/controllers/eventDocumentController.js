const mongoose = require("mongoose");
const Event = require("../models/Event");
const EventDocument = require("../models/EventDocument");

const validDocumentTypes = EventDocument.schema.path("type").enumValues;
const validQrTypes = EventDocument.schema.path("qrType").enumValues;

function isValidWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateDocumentFields({ type, qrType, title, url }) {
  if (!validDocumentTypes.includes(type)) return "Select a valid document type";
  if (type === "qr-code" && !validQrTypes.includes(qrType)) return "Select a valid QR code type";
  if (typeof title !== "string" || !title.trim()) return "Title is required";
  if (typeof url !== "string" || !isValidWebUrl(url.trim())) {
    return "Enter a valid HTTP or HTTPS URL";
  }
  return "";
}

const getEventDocuments = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.eventId).select("title startDate endDate category");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const documents = await EventDocument.find({ eventId: event._id }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, event, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch event documents" });
  }
};

const getAllEventDocuments = async (req, res) => {
  try {
    const documents = await EventDocument.find().sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch event documents" });
  }
};

const createEventDocument = async (req, res) => {
  try {
    const { eventId, type, qrType, title, url, description = "" } = req.body;
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ success: false, message: "Select a valid event" });
    }

    const validationError = validateDocumentFields({ type, qrType, title, url });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const eventExists = await Event.exists({ _id: eventId });
    if (!eventExists) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const document = await EventDocument.create({ eventId, type, qrType, title, url, description });
    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateEventDocument = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }

    const { type, qrType, title, url, description = "" } = req.body;
    const validationError = validateDocumentFields({ type, qrType, title, url });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const document = await EventDocument.findByIdAndUpdate(
      req.params.id,
      { type, qrType: type === "qr-code" ? qrType : "other", title, url, description },
      { new: true, runValidators: true }
    );
    if (!document) {
      return res.status(404).json({ success: false, message: "Event document not found" });
    }

    return res.status(200).json({ success: true, data: document });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteEventDocument = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }

    const document = await EventDocument.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: "Event document not found" });
    }

    return res.status(200).json({ success: true, message: "Event document deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete event document" });
  }
};

module.exports = {
  getAllEventDocuments,
  getEventDocuments,
  createEventDocument,
  updateEventDocument,
  deleteEventDocument,
};