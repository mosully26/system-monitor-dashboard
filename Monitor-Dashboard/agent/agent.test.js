const axios = require("axios");

const devices = [
  {
    deviceId: "web-server-01",
    name: "Web Server 01",
    cpu: 72,
    memory: 68,
    ipAddress: "192.168.1.10",
    uptime: 220000,
    status: "Online",
  },
  {
    deviceId: "database-server-01",
    name: "Database Server 01",
    cpu: 55,
    memory: 70,
    ipAddress: "192.168.1.11",
    uptime: 310000,
    status: "Online",
  },
  {
    deviceId: "helpdesk-pc-07",
    name: "Helpdesk PC 07",
    cpu: 24,
    memory: 41,
    ipAddress: "192.168.1.12",
    uptime: 12000,
    status: "Online",
  },
  {
    deviceId: "file-server-02",
    name: "File Server 02",
    cpu: 48,
    memory: 62,
    ipAddress: "192.168.1.13",
    uptime: 180000,
    status: "Online",
  },
  {
    deviceId: "backup-server",
    name: "Backup Server",
    cpu: 45,
    memory: 64,
    ipAddress: "192.168.1.14",
    uptime: 275000,
    status: "Online",
  },
  {
    deviceId: "network-switch-01",
    name: "Network Switch 01",
    cpu: 12,
    memory: 18,
    ipAddress: "192.168.1.15",
    uptime: 420000,
    status: "Online",
  },
];

async function sendFakeData() {
  try {
    for (const device of devices) {
      await axios.post("http://localhost:5000/api/report", device);
      console.log(
        `Sent: ${device.name} | ${device.status} | CPU ${device.cpu}% | Memory ${device.memory}%`
      );
    }
    console.log("-----");
  } catch (error) {
    console.error("Error sending fake data:", error.message);
  }
}

sendFakeData();
setInterval(sendFakeData, 10000);