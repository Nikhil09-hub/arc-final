const Event = require("../models/Event");

// Get all events
const getEvents = async (req, res) => {
  try {
    const { status } = req.query;

    const now = new Date();

    let filter = {};

    if (status === "upcoming") {
      filter = {
        startDate: { $gt: now },
      };
    }

    if (status === "ongoing") {
      filter = {
        startDate: { $lte: now },
        endDate: { $gte: now },
      };
    }

    if (status === "past") {
      filter = {
        endDate: { $lt: now },
      };
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

// Get single event
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

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

// Create a new event
const createEvent = async (req, res) => {
  try {
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
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

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
    const event = await Event.findOne({ slug: req.params.slug });

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
module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventBySlug,
};