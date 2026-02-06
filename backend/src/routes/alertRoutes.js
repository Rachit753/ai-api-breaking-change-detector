const express = require("express");
const router = express.Router();

const { getAlertsByEndpoint } = require("../models/alertModel");

/**
 * GET /api/alerts?endpoint=/test-user&method=POST
 * Returns alerts for a specific endpoint
 */
router.get("/", async (req, res) => {
  try {
    const { endpoint, method } = req.query;

    // Basic validation
    if (!endpoint || !method) {
      return res
        .status(400)
        .json({ error: "endpoint and method query params are required" });
    }

    const alerts = await getAlertsByEndpoint(endpoint, method);
    res.json(alerts);
  } catch (err) {
    console.error("Error fetching alerts:", err.message);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

module.exports = router;
