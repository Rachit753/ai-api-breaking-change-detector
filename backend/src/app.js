const express = require("express");
const cors = require("cors");

const trafficCapture = require("./middleware/trafficCapture");

const endpointRoutes = require("./routes/endpointRoutes");
const contractRoutes = require("./routes/contractRoutes");
const alertRoutes = require("./routes/alertRoutes");

const app = express();

app.use(cors());
app.use(express.json());

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

app.use(trafficCapture); // 👈 important

app.use("/api/endpoints", endpointRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/alerts", alertRoutes);

/*404 handler*/
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


/* Global error handler */
const errorHandler = require("./middleware/errorHandler");

app.use(errorHandler);


module.exports = app;
