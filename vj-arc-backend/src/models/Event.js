const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "workshop",
        "hackathon",
        "ai-ml",
        "coding",
        "other",
      ],
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    coverImage: {
      type: String,
      required: true,
      trim: true,
    },

    gallery: [
      {
        url: {
          type: String,
          required: true,
        },

        caption: {
          type: String,
          default: "",
        },

        order: {
          type: Number,
          default: 0,
        },
      },
    ],

    registration: {
      enabled: {
        type: Boolean,
        default: false,
      },

      link: {
        type: String,
        default: "",
      },
    },

    social: {
      linkedin: {
        type: String,
        default: "",
      },

      instagram: {
        type: String,
        default: "",
      },
    },

    report: {
      available: {
        type: Boolean,
        default: false,
      },

      url: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);