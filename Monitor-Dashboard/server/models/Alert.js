const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    type: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Info", "Warning", "Critical"],
      required: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved"],
      default: "active",
    },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);