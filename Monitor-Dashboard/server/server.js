const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

dotenv.config();

const devicesRoute = require("./routes/devices");
const alertsRoute = require("./routes/alerts");
const authRoute = require("./routes/auth");
const reportRoute = require("./routes/report");
const initSocket = require("./socket");

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors());
app.use(express.json());

app.use("/api/devices", devicesRoute);
app.use("/api/alerts", alertsRoute);
app.use("/api/auth", authRoute);
app.use("/api/report", reportRoute);

app.get("/", (req, res) => {
  res.send("System Monitor API is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });