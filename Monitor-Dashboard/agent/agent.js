const axios = require("axios");

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const devices = [
  { name: "Web Server 01", ip: "192.168.1.10", profile: "web" },
  { name: "Database Server 01", ip: "192.168.1.11", profile: "database" },
  { name: "Helpdesk PC 07", ip: "192.168.1.12", profile: "desktop" },
  { name: "File Server 02", ip: "192.168.1.13", profile: "file" },
  { name: "Backup Server", ip: "192.168.1.14", profile: "backup" },
  { name: "Network Switch 01", ip: "192.168.1.15", profile: "network" },
];

function generateMetrics(device) {
  let cpu = 0;
  let memory = 0;
  let status = "Online";

  switch (device.profile) {
    case "database":
      cpu = getRandom(40, 80);
      memory = getRandom(70, 95); // high memory
      break;

    case "web":
      cpu = getRandom(20, 85);
      memory = getRandom(40, 70);
      break;

    case "desktop":
      cpu = getRandom(10, 55);
      memory = getRandom(25, 65);

      // simulate occasional offline
      if (Math.random() < 0.2) {
        status = "Offline";
        cpu = 0;
        memory = 0;
      }
      break;

    case "file":
      cpu = getRandom(15, 45);
      memory = getRandom(45, 80);
      break;

    case "backup":
      cpu = getRandom(20, 60);
      memory = getRandom(40, 85);

      // occasional spike
      if (Math.random() < 0.2) {
        cpu = getRandom(85, 95);
        memory = getRandom(85, 95);
      }
      break;

    case "network":
      cpu = getRandom(5, 20);
      memory = getRandom(10, 30);
      break;
  }

  // determine warning
  if (status !== "Offline" && (cpu > 85 || memory > 85)) {
    status = "Warning";
  }

  return {
    deviceId: device.name.replace(/\s+/g, "-").toLowerCase(),
    name: device.name,
    cpu,
    memory,
    ipAddress: device.ip,
    uptime: getRandom(10000, 500000),
    status,
  };
}

async function sendFakeData() {
  try {
    for (const device of devices) {
      const payload = generateMetrics(device);

      await axios.post("http://localhost:5000/api/report", payload);

      console.log(
        `${payload.name} | ${payload.status} | CPU ${payload.cpu}% | Memory ${payload.memory}%`
      );
    }

    console.log("-----");
  } catch (error) {
    console.error("Error sending fake data:", error.message);
  }
}

sendFakeData();
setInterval(sendFakeData, 10000);