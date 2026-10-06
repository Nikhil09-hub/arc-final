const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const RegistrationParticipant = require("../models/RegistrationParticipant");
const { calculateRegistrationAmount } = require("../services/registrationFeeService");

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const cleanText = (value) =>
  typeof value === "string" ? value.trim() : "";

const createRegistration = async (req, res) => {
  try {
    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? req.body
        : {};
    const { eventId } = body;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "A valid eventId is required",
      });
    }

    const eventFilter = { _id: eventId };
    if (!req.admin) eventFilter.visibility = { $ne: "admin" };
    const event = await Event.findOne(eventFilter);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const regConfig = event.registration;
    const isEnabled = Boolean(regConfig?.enabled);
    const regType =
      regConfig?.type ||
      (regConfig?.link?.trim() ? "external" : isEnabled ? "internal" : "none");

    if (!isEnabled || regType !== "internal") {
      return res.status(400).json({
        success: false,
        message: "This event does not accept website registrations.",
      });
    }

    if (Boolean(regConfig?.payment?.enabled)) {
      return res.status(400).json({
        success: false,
        message: "Paid registrations must be processed through the payment flow.",
      });
    }

    const now = new Date();
    const startDate = regConfig?.startDate ? new Date(regConfig.startDate) : null;
    const endDate = regConfig?.endDate ? new Date(regConfig.endDate) : null;

    if (
      !startDate ||
      !endDate ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(403).json({
        success: false,
        message: "Registration is closed.",
      });
    }

    if (startDate && now < startDate) {
      return res.status(403).json({
        success: false,
        message: "Registration has not opened yet.",
      });
    }

    if (endDate && now > endDate) {
      return res.status(403).json({
        success: false,
        message: "Registration is closed.",
      });
    }

    const registrationType = regConfig.format || "individual";
    if (
      body.registrationType &&
      body.registrationType !== registrationType
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration format does not match this event configuration.",
      });
    }

    let registrationData;
    let participants;
    if (registrationType === "individual") {
      const participant = {
        fullName: cleanText(body.fullName),
        rollNo: cleanText(body.rollNo),
        email: cleanText(body.email).toLowerCase(),
        phone: cleanText(body.phone),
        college: cleanText(body.college),
        department: cleanText(body.department),
        year: cleanText(body.year),
      };
      if (Object.values(participant).some((value) => !value)) {
        return res.status(400).json({
          success: false,
          message: "All participant fields are required.",
        });
      }
      if (!validEmail(participant.email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address.",
        });
      }
      registrationData = {
        eventId: event._id,
        registrationType,
        ...participant,
        payment: {
          required: false,
          amount: 0,
          currency: "INR",
          status: "not_required",
          provider: "cashfree",
          orderId: "",
          paymentId: "",
          paidAt: null,
        },
      };
      participants = [{ rollNo: participant.rollNo }];
    } else {
      const teamConfig = regConfig.team || {};
      const minMembers = Number(teamConfig.minimumMembers) || 2;
      const maxMembers = Number(teamConfig.maximumMembers) || 4;
      const team = body.team && typeof body.team === "object" ? body.team : {};
      const leader =
        team.leader && typeof team.leader === "object" ? team.leader : {};
      const members = Array.isArray(team.members) ? team.members : [];
      const teamName = cleanText(team.teamName);

      if (
        !Number.isInteger(minMembers) ||
        !Number.isInteger(maxMembers) ||
        minMembers < 2 ||
        maxMembers < minMembers
      ) {
        console.error(`Invalid team size configuration on event ${event._id}`);
        return res.status(500).json({
          success: false,
          message: "Team registration is incorrectly configured.",
        });
      }
      if (teamConfig.teamNameEnabled && teamConfig.teamNameRequired && !teamName) {
        return res.status(400).json({
          success: false,
          message: "Team name is required.",
        });
      }
      if (
        !teamConfig.teamNameEnabled &&
        teamName
      ) {
        return res.status(400).json({
          success: false,
          message: "Team name is not enabled for this event.",
        });
      }

      const teamSize = members.length + 1;
      if (teamSize < minMembers || teamSize > maxMembers) {
        return res.status(400).json({
          success: false,
          message: `Team size must be between ${minMembers} and ${maxMembers} members.`,
        });
      }

      const cleanLeader = {
        name: cleanText(leader.name),
        rollNo: cleanText(leader.rollNo),
        email: cleanText(leader.email).toLowerCase(),
        phone: cleanText(leader.phone),
      };
      const cleanMembers = members.map((member) => ({
        name: cleanText(member?.name),
        rollNo: cleanText(member?.rollNo),
        email: cleanText(member?.email).toLowerCase(),
        phone: cleanText(member?.phone),
      }));
      const teamFields = [
        ...Object.values(cleanLeader),
        ...cleanMembers.flatMap((member) => Object.values(member)),
      ];
      if (teamFields.some((value) => !value)) {
        return res.status(400).json({
          success: false,
          message: "Every team member must provide a name, roll number, email, and phone number.",
        });
      }
      if (
        !validEmail(cleanLeader.email) ||
        cleanMembers.some((member) => !validEmail(member.email))
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address for every team member.",
        });
      }

      participants = [
        { rollNo: cleanLeader.rollNo },
        ...cleanMembers.map(({ rollNo }) => ({ rollNo })),
      ];
      registrationData = {
        eventId: event._id,
        registrationType,
        fullName: cleanLeader.name,
        rollNo: cleanLeader.rollNo,
        email: cleanLeader.email,
        phone: cleanLeader.phone,
        team: {
          teamName,
          teamSize,
          leader: cleanLeader,
          members: cleanMembers,
        },
        payment: {
          required: false,
          amount: 0,
          currency: "INR",
          status: "not_required",
          provider: "cashfree",
          orderId: "",
          paymentId: "",
          paidAt: null,
        },
      };
    }

    const computedAmount = calculateRegistrationAmount(event, registrationData);
    if (computedAmount > 0) {
      return res.status(400).json({
        success: false,
        message: "Online payment will be available soon.",
      });
    }

    const normalizedRollNumbers = participants.map(({ rollNo }) =>
      rollNo.toUpperCase()
    );
    if (new Set(normalizedRollNumbers).size !== normalizedRollNumbers.length) {
      return res.status(409).json({
        success: false,
        message: "A roll number can only appear once in a team.",
      });
    }

    const existingRegistrations = await Registration.find({
      eventId: event._id,
    }).select("rollNo team.members.rollNo");
    const existingRollNumbers = new Set();
    for (const existing of existingRegistrations) {
      if (existing.rollNo) existingRollNumbers.add(existing.rollNo.toUpperCase());
      for (const member of existing.team?.members || []) {
        if (member.rollNo) existingRollNumbers.add(member.rollNo.toUpperCase());
      }
    }
    if (normalizedRollNumbers.some((rollNo) => existingRollNumbers.has(rollNo))) {
      return res.status(409).json({
        success: false,
        message: "One or more roll numbers are already registered for this event.",
      });
    }

    const registrationId = new mongoose.Types.ObjectId();
    let registration;
    await RegistrationParticipant.init();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        [registration] = await Registration.create(
          [{ ...registrationData, _id: registrationId }],
          { session }
        );
        await RegistrationParticipant.insertMany(
          participants.map(({ rollNo }) => ({
            eventId: event._id,
            rollNo: rollNo.toUpperCase(),
            registrationId,
          })),
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: registration,
    });
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern?.eventId &&
      error.keyPattern?.rollNo
    ) {
      return res.status(409).json({
        success: false,
        message: "One or more roll numbers are already registered for this event.",
      });
    }

    console.error("Error creating registration:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to process registration",
    });
  }
};

// Get summary of events with internal registration counts (Admin only)
const getRegistrationsSummary = async (req, res) => {
  try {
    const counts = await Registration.aggregate([
      {
        $group: {
          _id: "$eventId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      if (item._id) {
        countMap[item._id.toString()] = item.count;
      }
    });

    const eventIdsWithRegistrations = counts
      .filter((c) => c._id)
      .map((c) => c._id);

    const events = await Event.find({
      $or: [
        { "registration.enabled": true, "registration.type": "internal" },
        {
          "registration.enabled": true,
          "registration.type": { $exists: false },
          $or: [
            { "registration.link": "" },
            { "registration.link": { $exists: false } },
          ],
        },
        { _id: { $in: eventIdsWithRegistrations } },
      ],
    }).sort({ startDate: -1 });

    const summary = events.map((event) => {
      const plain = event.toJSON ? event.toJSON() : event.toObject();
      return {
        ...plain,
        registrationCount: countMap[event._id.toString()] || 0,
      };
    });

    return res.status(200).json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching registrations summary:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations summary",
    });
  }
};

// Get all registrations (Admin only)
const getRegistrations = async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = {};

    if (eventId) {
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID in query",
        });
      }
      filter.eventId = eventId;
    }

    const registrations = await Registration.find(filter)
      .populate("eventId", "title slug startDate endDate venue")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
    });
  }
};

// Get registrations for a specific event (Admin only)
const getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(eventId).select(
      "title slug startDate endDate venue registration"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const registrations = await Registration.find({ eventId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      event,
      data: registrations,
    });
  } catch (error) {
    console.error("Error fetching registrations for event:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations for event",
    });
  }
};

// Delete a registration by ID (Admin only)
const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID",
      });
    }

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await RegistrationParticipant.deleteMany(
          { registrationId: registration._id },
          { session }
        );
        await Registration.deleteOne({ _id: registration._id }, { session });
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting registration:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete registration",
    });
  }
};

module.exports = {
  createRegistration,
  getRegistrationsSummary,
  getRegistrations,
  getRegistrationsByEvent,
  deleteRegistration,
};
