
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getEvents,
  getEventById,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const router = express.Router();

router.get("/", getEvents);

router.get("/slug/:slug", getEventBySlug);

router.get("/:id", getEventById);

router.post("/", protect, createEvent);

router.put("/:id", protect, updateEvent);

router.delete("/:id", protect, deleteEvent);

module.exports = router;