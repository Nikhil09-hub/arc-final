const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createRegistration,
  getRegistrationsSummary,
  getRegistrations,
  getRegistrationsByEvent,
  deleteRegistration,
} = require("../controllers/registrationController");

const router = express.Router();

// Public: Submit event registration
router.post("/", createRegistration);
router.post("/admin", protect, createRegistration);

// Admin-protected: list all, list by event, delete
router.get("/summary", protect, getRegistrationsSummary);
router.get("/", protect, getRegistrations);
router.get("/event/:eventId", protect, getRegistrationsByEvent);
router.delete("/:id", protect, deleteRegistration);

module.exports = router;
