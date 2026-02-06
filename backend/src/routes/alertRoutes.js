const express = require("express");
const router = express.Router();

const { getAlertsByEndpoint } = require("../models/alertModel");
const { estimateImpact } = require("../services/impactAnalysis");



router.get("/", async (req, res) => {
  try {
    const { endpoint, method } = req.query;

    if (!endpoint || !method) {
      return res
        .status(400)
        .json({ error: "endpoint and method query params are required" });
    }

    const alerts = await getAlertsByEndpoint(endpoint, method);

    // Attach impact % to each alert
    const impact = await estimateImpact(endpoint, method);

    res.json({ alerts, impact });
  } catch (err) {
    console.error("Error fetching alerts:", err.message);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});


module.exports = router;
