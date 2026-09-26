const mongoose = require("mongoose");

const eventDocumentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "plan-of-action",
        "event-report",
        "logistics",
        "qr-code",
        "certificates",
        "attendance",
        "posters-creatives",
        "registration",
        "other",
      ],
    },
    qrType: {
      type: String,
      enum: ["registration", "attendance", "feedback", "certificate", "other"],
      default: "other",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventDocument", eventDocumentSchema);