const express = require("express");
const Device = require("../models/Device");
const Metric = require("../models/Metric");
const Alert = require("../models/Alert");
const { getIO } = require("../socket");

const router = express.Router();

const CPU_THRESHOLD = 85;
const MEMORY_THRESHOLD = 85;

async function createAlertIfMissing({ deviceId, type, severity, message }) {
  const existingAlert = await Alert.findOne({
    deviceId,
    type,
    message,
    status: { $in: ["active", "acknowledged"] },
  });

  if (!existingAlert) {
    await Alert.create({
      deviceId,
      type,
      severity,
      message,
      status: "active",
    });
  }
}

async function resolveAlerts(deviceId, type) {
  await Alert.updateMany(
    {
      deviceId,
      type,
      status: { $in: ["active", "acknowledged"] },
    },
    {
      $set: {
        status: "resolved",
        resolvedAt: new Date(),
      },
    }
  );
}

router.post("/", async (req, res) => {
  try {
    const {
      deviceId,
      name,
      cpu = 0,
      memory = 0,
      ipAddress = "",
      uptime = 0,
      status: incomingStatus,
    } = req.body;

    if (!deviceId || !name) {
      return res.status(400).json({ message: "deviceId and name are required" });
    }

    let status = incomingStatus || "Online";

    if (status !== "Offline" && (cpu > CPU_THRESHOLD || memory > MEMORY_THRESHOLD)) {
      status = "Warning";
    }

    if (status !== "Offline" && cpu <= CPU_THRESHOLD && memory <= MEMORY_THRESHOLD) {
      status = "Online";
    }

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        name,
        cpu,
        memory,
        ipAddress,
        uptime,
        status,
        lastCheck: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Metric.create({
      deviceId,
      cpu,
      memory,
      timestamp: new Date(),
    });

    if (status === "Offline") {
      await createAlertIfMissing({
        deviceId,
        type: "Offline",
        severity: "Critical",
        message: `${name} is offline`,
      });
    } else {
      await resolveAlerts(deviceId, "Offline");
    }

    if (cpu > CPU_THRESHOLD && status !== "Offline") {
      await createAlertIfMissing({
        deviceId,
        type: "CPU",
        severity: "Warning",
        message: `${name} CPU usage above ${CPU_THRESHOLD}%`,
      });
    } else {
      await resolveAlerts(deviceId, "CPU");
    }

    if (memory > MEMORY_THRESHOLD && status !== "Offline") {
      await createAlertIfMissing({
        deviceId,
        type: "Memory",
        severity: "Warning",
        message: `${name} memory usage above ${MEMORY_THRESHOLD}%`,
      });
    } else {
      await resolveAlerts(deviceId, "Memory");
    }

    const io = getIO();
    if (io) {
      io.emit("deviceUpdated", device);
      const activeAlerts = await Alert.find({ status: "active" }).sort({ createdAt: -1 });
      io.emit("alertsUpdated", activeAlerts);
    }

    res.json({ message: "Report received", device });
  } catch (error) {
    console.error("Report route error:", error);
    res.status(500).json({ message: "Failed to process report" });
  }
});

module.exports = router;