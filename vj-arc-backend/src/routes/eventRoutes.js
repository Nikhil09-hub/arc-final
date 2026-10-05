
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getEvents,
  getAdminEvents,
  getEventById,
  getAdminEventById,
  getEventBySlug,
  getAdminEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const router = express.Router();

router.get("/admin", protect, getAdminEvents);
router.get("/admin/slug/:slug", protect, getAdminEventBySlug);
router.get("/admin/:id", protect, getAdminEventById);

router.get("/", getEvents);

router.get("/slug/:slug", getEventBySlug);

router.get("/:id", getEventById);

router.post("/", protect, createEvent);

router.put("/:id", protect, updateEvent);

router.delete("/:id", protect, deleteEvent);

module.exports = router;