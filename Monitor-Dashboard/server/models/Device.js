const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["Online", "Warning", "Offline"],
      default: "Online",
    },
    cpu: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    ipAddress: { type: String, default: "" },
    lastCheck: { type: Date, default: Date.now },
    uptime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);