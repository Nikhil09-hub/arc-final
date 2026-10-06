const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      enum: ["none", "external", "internal"],
      default: function () {
        if (this.enabled && this.link && this.link.trim() !== "") {
          return "external";
        }
        if (this.enabled) {
          return "internal";
        }
        return "none";
      },
    },

    format: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
    },

    team: {
      minimumMembers: {
        type: Number,
        default: 2,
        min: 2,
      },
      maximumMembers: {
        type: Number,
        default: 4,
        min: 2,
      },
      teamNameEnabled: {
        type: Boolean,
        default: true,
      },
      teamNameRequired: {
        type: Boolean,
        default: true,
      },
    },

    link: {
      type: String,
      default: "",
      trim: true,
    },

    payment: {
      enabled: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
        trim: true,
        uppercase: true,
      },
      feeType: {
        type: String,
        enum: ["per_participant", "per_team"],
        default: "per_participant",
      },
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          if (!value || !this.startDate) return true;
          return new Date(value) > new Date(this.startDate);
        },
        message: "Registration end date must be after registration start date",
      },
    },
  },
  {
    _id: false,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

// Backward compatibility: If document was saved without type, derive it dynamically
registrationSchema.path("type").get(function (val) {
  if (val) return val;
  if (this.enabled && this.link && this.link.trim() !== "") {
    return "external";
  }
  return this.enabled ? "internal" : "none";
});

// Dynamic registration status: "not-open", "open", "closed"
registrationSchema.virtual("status").get(function () {
  if (!this.enabled) return "closed";
  const now = new Date();
  if (this.startDate && now < new Date(this.startDate)) {
    return "not-open";
  }
  if (this.endDate && now > new Date(this.endDate)) {
    return "closed";
  }
  if (this.startDate || this.endDate) {
    return "open";
  }
  const regType = this.type;
  if (regType === "external") return "open";
  return "closed";
});

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
      type: registrationSchema,
      default: () => ({}),
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
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

eventSchema.methods.getRegistrationStatus = function (now = new Date()) {
  const reg = this.registration;
  if (!reg || !reg.enabled) return "closed";
  const currentTime = now instanceof Date ? now : new Date(now);
  if (reg.startDate && currentTime < new Date(reg.startDate)) {
    return "not-open";
  }
  if (reg.endDate && currentTime > new Date(reg.endDate)) {
    return "closed";
  }
  if (reg.startDate || reg.endDate) {
    return "open";
  }
  const regType = reg.type;
  if (regType === "external") return "open";
  return "closed";
};

eventSchema.add({
  visibility: {
    type: String,
    enum: ["public", "admin"],
    default: "public",
  },
});

eventSchema.pre("validate", function () {
  const registrationTeam = this.registration?.team;
  if (
    registrationTeam &&
    registrationTeam.maximumMembers < registrationTeam.minimumMembers
  ) {
    this.invalidate(
      "registration.team.maximumMembers",
      "Maximum team size must be at least the minimum team size"
    );
  }

  const payment = this.registration?.payment;
  if (!this.registration || this.registration.type !== "internal") {
    return;
  }

  if (!payment) {
    this.registration.payment = {
      enabled: false,
      amount: 0,
      currency: "INR",
      feeType: "per_participant",
    };
    return;
  }

  if (payment.amount !== undefined && Number(payment.amount) < 0) {
    this.invalidate(
      "registration.payment.amount",
      "Payment amount cannot be negative."
    );
  }

  if (payment.currency && payment.currency.toUpperCase() !== "INR") {
    this.invalidate(
      "registration.payment.currency",
      "Only INR is supported for registration payment configuration."
    );
  }

  if (payment.feeType && !["per_participant", "per_team"].includes(payment.feeType)) {
    this.invalidate(
      "registration.payment.feeType",
      "Registration fee type must be per_participant or per_team."
    );
  }

  if (payment.enabled) {
    if (!Number.isFinite(Number(payment.amount)) || Number(payment.amount) <= 0) {
      this.invalidate(
        "registration.payment.amount",
        "Paid registration amount must be greater than zero."
      );
    }

    if (this.registration.format === "individual" && payment.feeType !== "per_participant") {
      this.invalidate(
        "registration.payment.feeType",
        "Individual registration fees must be charged per participant."
      );
    }
  } else {
    payment.amount = 0;
    payment.currency = "INR";
    payment.feeType = payment.feeType || "per_participant";
  }
});

module.exports = mongoose.model("Event", eventSchema);
module.exports = mongoose.model("Event", eventSchema);