const express = require("express");
const Alert = require("../models/Alert");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const status = req.query.status || "active";
    const query = status === "all" ? {} : { status };

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

router.patch("/:id/acknowledge", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: "acknowledged" },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Failed to acknowledge alert" });
  }
});

router.patch("/:id/resolve", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve alert" });
  }
});

module.exports = router;