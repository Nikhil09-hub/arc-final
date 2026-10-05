const Event = require("../models/Event");
const EventDocument = require("../models/EventDocument");

const hasInvalidTeamSize = (registration = {}) => {
  if (
    registration.type !== "internal" ||
    registration.format !== "team"
  ) {
    return false;
  }
  const minimum = Number(registration.team?.minimumMembers);
  const maximum = Number(registration.team?.maximumMembers);
  return (
    !Number.isInteger(minimum) ||
    !Number.isInteger(maximum) ||
    minimum < 2 ||
    maximum < minimum
  );
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const { status } = req.query;

    const now = new Date();

    const filter = { visibility: { $ne: "admin" } };

    if (status === "upcoming") {
      filter.startDate = { $gt: now };
    }

    if (status === "ongoing") {
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    if (status === "past") {
      filter.endDate = { $lt: now };
    }

    const events = await Event.find(filter).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

const getAdminEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const now = new Date();
    const filter = {};

    if (status === "upcoming") filter.startDate = { $gt: now };
    if (status === "ongoing") {
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }
    if (status === "past") filter.endDate = { $lt: now };

    const events = await Event.find(filter).sort({ startDate: 1 });
    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching admin events:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// Get single event
const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      visibility: { $ne: "admin" },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

const getAdminEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error("Error fetching admin event:", error.message);
    return res.status(400).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    if (hasInvalidTeamSize(req.body?.registration)) {
      return res.status(400).json({
        success: false,
        message: "Team sizes must be whole numbers, at least two, and maximum must not be less than minimum.",
      });
    }
    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// Update an event
const updateEvent = async (req, res) => {
  try {
    if (hasInvalidTeamSize(req.body?.registration)) {
      return res.status(400).json({
        success: false,
        message: "Team sizes must be whole numbers, at least two, and maximum must not be less than minimum.",
      });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await EventDocument.deleteMany({ eventId: event._id });
    await Event.deleteOne({ _id: event._id });

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({
      slug: req.params.slug,
      visibility: { $ne: "admin" },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error("Error fetching admin event by slug:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

module.exports = {
  getEvents,
  getAdminEvents,
  getEventById,
  getAdminEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventBySlug,
  getAdminEventBySlug,
};