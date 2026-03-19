const express = require("express");
const Device = require("../models/Device");
const Metric = require("../models/Metric");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const devices = await Device.find().sort({ name: 1 });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch devices" });
  }
});

router.get("/:deviceId", async (req, res) => {
  try {
    const device = await Device.findOne({ deviceId: req.params.deviceId });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch device" });
  }
});

router.get("/:deviceId/metrics", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;

    const metrics = await Metric.find({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(metrics.reverse());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});

module.exports = router;