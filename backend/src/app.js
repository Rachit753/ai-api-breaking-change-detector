const express = require("express");
const cors = require("cors");

const trafficCapture = require("./middleware/trafficCapture");

const app = express();

app.use(cors());
app.use(express.json());

app.use(trafficCapture); // 👈 important

app.get("/", (req, res) => {
  res.send("🚀 GuardAI API Contract Intelligence Server Running");
});


app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

/* Test endpoint */
app.post("/test-user", (req, res) => {
  res.json({
    id: 1,
    ...req.body,
  });
});

module.exports = app;
