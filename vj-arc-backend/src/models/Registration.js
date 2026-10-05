const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const teamLeaderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, trim: true, default: "" },
    teamSize: { type: Number, required: true, min: 2 },
    leader: { type: teamLeaderSchema, required: true },
    members: { type: [teamMemberSchema], default: [] },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },

    registrationType: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
      required: true,
    },

    fullName: {
      type: String,
      required() {
        return this.registrationType === "individual";
      },
      trim: true,
    },

    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true,
    },

    email: {
      type: String,
      required() {
        return this.registrationType === "individual";
      },
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required() {
        return this.registrationType === "individual";
      },
      trim: true,
    },

    college: {
      type: String,
      required() {
        return this.registrationType === "individual";
      },
      trim: true,
    },

    department: {
      type: String,
      required() {
        return this.registrationType === "individual";
      },
      trim: true,
    },

    year: {
      type: String,
      required() {
        return this.registrationType === "individual";
      },
      trim: true,
    },

    team: {
      type: teamSchema,
      required: function () {
        return this.registrationType === "team";
      },
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index({ eventId: 1, rollNo: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
