const mongoose = require("mongoose");

const registrationParticipantSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    rollNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
  },
  { timestamps: true }
);

registrationParticipantSchema.index(
  { eventId: 1, rollNo: 1 },
  { unique: true }
);
registrationParticipantSchema.index({ registrationId: 1 });

module.exports = mongoose.model(
  "RegistrationParticipant",
  registrationParticipantSchema
);
