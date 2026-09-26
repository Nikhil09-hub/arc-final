const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getAllEventDocuments,
  getEventDocuments,
  createEventDocument,
  updateEventDocument,
  deleteEventDocument,
} = require("../controllers/eventDocumentController");

const router = express.Router();

router.use(protect);
router.get("/", getAllEventDocuments);
router.get("/:eventId", getEventDocuments);
router.post("/", createEventDocument);
router.put("/:id", updateEventDocument);
router.delete("/:id", deleteEventDocument);

module.exports = router;