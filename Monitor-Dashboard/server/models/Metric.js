const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    cpu: { type: Number, required: true },
    memory: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Metric", metricSchema);