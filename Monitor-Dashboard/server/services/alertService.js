const Alert = require("../models/Alert");

async function createAlertIfMissing({ deviceId, type, severity, message }) {
  const existingAlert = await Alert.findOne({
    deviceId,
    type,
    message,
    status: { $in: ["active", "acknowledged"] },
  });

  if (!existingAlert) {
    return await Alert.create({
      deviceId,
      type,
      severity,
      message,
      status: "active",
    });
  }

  return existingAlert;
}

async function resolveAlerts(deviceId, type) {
  return await Alert.updateMany(
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

async function getActiveAlerts() {
  return await Alert.find({ status: "active" }).sort({ createdAt: -1 });
}

async function acknowledgeAlert(alertId) {
  return await Alert.findByIdAndUpdate(
    alertId,
    { status: "acknowledged" },
    { new: true }
  );
}

async function resolveAlertById(alertId) {
  return await Alert.findByIdAndUpdate(
    alertId,
    {
      status: "resolved",
      resolvedAt: new Date(),
    },
    { new: true }
  );
}

module.exports = {
  createAlertIfMissing,
  resolveAlerts,
  getActiveAlerts,
  acknowledgeAlert,
  resolveAlertById,
};