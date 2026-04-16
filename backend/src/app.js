const express = require("express");
const cors = require("cors");

const trafficCapture = require("./middleware/trafficCapture");
const authMiddleware = require("./auth/authMiddleware");

const endpointRoutes = require("./routes/endpointRoutes");
const contractRoutes = require("./routes/contractRoutes");
const alertRoutes = require("./routes/alertRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GuardAI API Contract Intelligence Server Running");
});


app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use(trafficCapture);

app.post("/test-user", authMiddleware, (req, res) => {
  res.json({
    id: 1,
    ...req.body,
  });
});


app.use("/api/endpoints", authMiddleware, endpointRoutes);
app.use("/api/contracts", authMiddleware, contractRoutes);
app.use("/api/alerts", authMiddleware, alertRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);
app.use("/api/projects", authMiddleware, projectRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const errorHandler = require("./middleware/errorHandler");

app.use(errorHandler);


module.exports = app;
