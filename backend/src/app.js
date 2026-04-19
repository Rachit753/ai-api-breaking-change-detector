const express = require("express");
const cors = require("cors");

const trafficCapture = require("./middleware/trafficCapture");
const authMiddleware = require("./auth/authMiddleware");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");

const endpointRoutes = require("./routes/endpointRoutes");
const contractRoutes = require("./routes/contractRoutes");
const alertRoutes = require("./routes/alertRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const projectRoutes = require("./routes/projectRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.send("GuardAI API Contract Intelligence Server Running");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use("/api/auth", authLimiter, authRoutes);

app.use("/api", authMiddleware, trafficCapture);

app.use("/api/endpoints", endpointRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/simulate", simulatorRoutes);

app.post("/api/test-user", (req, res) => {
  res.json({
    id: 1,
    ...req.body,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;