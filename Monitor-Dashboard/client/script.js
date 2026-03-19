const tableBody = document.getElementById("deviceTableBody");
const alertsList = document.getElementById("alertsList");
const refreshButton = document.querySelector("header button");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortBy = document.getElementById("sortBy");
const sortableHeaders = document.querySelectorAll(".sortable");

let cpuChart;
let memoryChart;
let allDevices = [];

let currentHeaderSort = {
  field: null,
  direction: "asc",
};

function getStatusClass(status) {
  return (status || "Online").toLowerCase();
}

function getAlertClass(type) {
  return (type || "Info").toLowerCase();
}

function getAlertIcon(type) {
  if (type === "Critical") {
    return `<i class="fa-solid fa-circle-xmark"></i>`;
  }

  if (type === "Warning") {
    return `<i class="fa-solid fa-triangle-exclamation"></i>`;
  }

  return `<i class="fa-solid fa-circle-check"></i>`;
}

function formatTime(value) {
  if (!value) return "Just now";

  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function updateLastUpdated() {
  let lastUpdated = document.getElementById("lastUpdated");

  if (!lastUpdated) {
    lastUpdated = document.createElement("p");
    lastUpdated.id = "lastUpdated";
    lastUpdated.className = "last-updated";
    document.querySelector("header").appendChild(lastUpdated);
  }

  lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}

function updateSummaryCounts(devices) {
  const online = devices.filter((d) => d.status === "Online").length;
  const warning = devices.filter((d) => d.status === "Warning").length;
  const offline = devices.filter((d) => d.status === "Offline").length;

  document.getElementById("totalDevices").textContent = devices.length;
  document.getElementById("onlineCount").textContent = online;
  document.getElementById("warningCount").textContent = warning;
  document.getElementById("offlineCount").textContent = offline;
}

function renderDevices(devices) {
  tableBody.innerHTML = "";

  if (!devices || devices.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">No matching devices found</td>
      </tr>
    `;
    return;
  }

  devices.forEach((device) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${device.name}</td>
      <td>
        <span class="status ${getStatusClass(device.status)}">
          ${device.status}
        </span>
      </td>
      <td>${device.cpu}%</td>
      <td>${device.memory}%</td>
      <td>${formatTime(device.lastCheck)}</td>
    `;

    tableBody.appendChild(row);
  });
}

function normalizeAlert(alert) {
  return {
    id: alert._id,
    type: alert.severity || "Info",
    message: alert.message || "No alert message",
    time: alert.createdAt || new Date().toISOString(),
  };
}

function renderAlerts(alerts) {
  alertsList.innerHTML = "";

  if (!alerts || alerts.length === 0) {
    alertsList.innerHTML = `<p class="no-alerts">No active alerts</p>`;
    return;
  }

  alerts.forEach((alert) => {
    const normalizedAlert = normalizeAlert(alert);

    const alertItem = document.createElement("div");
    alertItem.className = `alert-item ${getAlertClass(normalizedAlert.type)}`;

    alertItem.innerHTML = `
      <div class="alert-icon">${getAlertIcon(normalizedAlert.type)}</div>
      <div class="alert-content">
        <p class="alert-message">${normalizedAlert.message}</p>
        <span class="alert-time">${formatTime(normalizedAlert.time)}</span>
      </div>
    `;

    alertsList.appendChild(alertItem);
  });
}

function renderCharts(devices) {
  const cpuCanvas = document.getElementById("cpuChart");
  const memoryCanvas = document.getElementById("memoryChart");

  if (!cpuCanvas || !memoryCanvas) {
    return;
  }

  const labels = devices.map((device) => device.name);
  const cpuData = devices.map((device) => device.cpu);
  const memoryData = devices.map((device) => device.memory);

  if (cpuChart) {
    cpuChart.destroy();
  }

  if (memoryChart) {
    memoryChart.destroy();
  }

  const cpuCtx = cpuCanvas.getContext("2d");
  const memoryCtx = memoryCanvas.getContext("2d");

  cpuChart = new Chart(cpuCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "CPU Usage (%)",
          data: cpuData,
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
        },
      },
    },
  });

  memoryChart = new Chart(memoryCtx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Memory Usage (%)",
          data: memoryData,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function updateControlStyles() {
  if (!searchInput || !statusFilter || !sortBy) return;

  searchInput.classList.remove("control-active");
  statusFilter.classList.remove(
    "filter-all",
    "filter-online",
    "filter-warning",
    "filter-offline"
  );
  sortBy.classList.remove("sort-default", "sort-active");

  if (searchInput.value.trim()) {
    searchInput.classList.add("control-active");
  }

  switch (statusFilter.value) {
    case "Online":
      statusFilter.classList.add("filter-online");
      break;
    case "Warning":
      statusFilter.classList.add("filter-warning");
      break;
    case "Offline":
      statusFilter.classList.add("filter-offline");
      break;
    default:
      statusFilter.classList.add("filter-all");
  }

  if (currentHeaderSort.field || sortBy.value !== "name-asc") {
    sortBy.classList.add("sort-active");
  } else {
    sortBy.classList.add("sort-default");
  }
}

function updateHeaderIndicators() {
  sortableHeaders.forEach((header) => {
    header.classList.remove("active", "asc", "desc");

    const indicator = header.querySelector(".sort-indicator");
    if (indicator) {
      indicator.textContent = "";
    }

    const field = header.dataset.sort;

    if (field === currentHeaderSort.field) {
      header.classList.add("active", currentHeaderSort.direction);

      if (indicator) {
        indicator.textContent = currentHeaderSort.direction === "asc" ? "▲" : "▼";
      }
    }
  });
}

function filterAndSortDevices(devices) {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedSort = sortBy.value;

  let filteredDevices = [...devices];

  if (searchTerm) {
    filteredDevices = filteredDevices.filter((device) =>
      device.name.toLowerCase().includes(searchTerm)
    );
  }

  if (selectedStatus !== "all") {
    filteredDevices = filteredDevices.filter(
      (device) => device.status === selectedStatus
    );
  }

  if (currentHeaderSort.field) {
    filteredDevices.sort((a, b) => {
      const { field, direction } = currentHeaderSort;

      let comparison = 0;

      if (field === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (field === "cpu") {
        comparison = a.cpu - b.cpu;
      } else if (field === "memory") {
        comparison = a.memory - b.memory;
      } else if (field === "lastCheck") {
        comparison = new Date(a.lastCheck) - new Date(b.lastCheck);
      }

      return direction === "asc" ? comparison : -comparison;
    });

    return filteredDevices;
  }

  filteredDevices.sort((a, b) => {
    switch (selectedSort) {
      case "name-asc":
        return a.name.localeCompare(b.name);

      case "name-desc":
        return b.name.localeCompare(a.name);

      case "cpu-desc":
        return b.cpu - a.cpu;

      case "cpu-asc":
        return a.cpu - b.cpu;

      case "memory-desc":
        return b.memory - a.memory;

      case "memory-asc":
        return a.memory - b.memory;

      case "lastCheck-desc":
        return new Date(b.lastCheck) - new Date(a.lastCheck);

      case "lastCheck-asc":
        return new Date(a.lastCheck) - new Date(b.lastCheck);

      default:
        return 0;
    }
  });

  return filteredDevices;
}

function applyDeviceView() {
  const visibleDevices = filterAndSortDevices(allDevices);
  updateControlStyles();
  updateHeaderIndicators();
  renderDevices(visibleDevices);
  renderCharts(visibleDevices);
}

async function loadDashboard() {
  try {
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.textContent = "Refreshing...";
    }

    const devicesRes = await fetch("http://localhost:5000/api/devices");
    const alertsRes = await fetch("http://localhost:5000/api/alerts");

    if (!devicesRes.ok || !alertsRes.ok) {
      throw new Error("API request failed");
    }

    const devices = await devicesRes.json();
    const alerts = await alertsRes.json();

    allDevices = devices;

    updateSummaryCounts(allDevices);
    applyDeviceView();
    renderAlerts(alerts);
    updateLastUpdated();
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.textContent = "Refresh";
    }
  }
}

if (searchInput) {
  searchInput.addEventListener("input", applyDeviceView);
}

if (statusFilter) {
  statusFilter.addEventListener("change", applyDeviceView);
}

if (sortBy) {
  sortBy.addEventListener("change", () => {
    currentHeaderSort.field = null;
    currentHeaderSort.direction = "asc";
    applyDeviceView();
  });
}

sortableHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    const field = header.dataset.sort;

    if (currentHeaderSort.field === field) {
      currentHeaderSort.direction =
        currentHeaderSort.direction === "asc" ? "desc" : "asc";
    } else {
      currentHeaderSort.field = field;
      currentHeaderSort.direction = "asc";
    }

    applyDeviceView();
  });
});

window.loadDashboard = loadDashboard;

loadDashboard();
setInterval(loadDashboard, 10000);