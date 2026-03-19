const Device = require("../models/Device");
const Metric = require("../models/Metric");

const CPU_THRESHOLD = 85;
const MEMORY_THRESHOLD = 85;

function determineDeviceStatus({ cpu = 0, memory = 0, incomingStatus = "Online" }) {
  let status = incomingStatus || "Online";

  if (status === "Offline") {
    return "Offline";
  }

  if (cpu > CPU_THRESHOLD || memory > MEMORY_THRESHOLD) {
    return "Warning";
  }

  return "Online";
}

async function upsertDevice({
  deviceId,
  name,
  cpu = 0,
  memory = 0,
  ipAddress = "",
  uptime = 0,
  status = "Online",
}) {
  return await Device.findOneAndUpdate(
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
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}

async function saveMetric({ deviceId, cpu = 0, memory = 0 }) {
  return await Metric.create({
    deviceId,
    cpu,
    memory,
    timestamp: new Date(),
  });
}

async function getAllDevices() {
  return await Device.find().sort({ name: 1 });
}

async function getDeviceById(deviceId) {
  return await Device.findOne({ deviceId });
}

async function getDeviceMetrics(deviceId, limit = 20) {
  const metrics = await Metric.find({ deviceId })
    .sort({ timestamp: -1 })
    .limit(limit);

  return metrics.reverse();
}

module.exports = {
  CPU_THRESHOLD,
  MEMORY_THRESHOLD,
  determineDeviceStatus,
  upsertDevice,
  saveMetric,
  getAllDevices,
  getDeviceById,
  getDeviceMetrics,
};