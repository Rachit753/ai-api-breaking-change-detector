const express = require("express");
const router = express.Router();

const { getAlertsByEndpoint } = require("../models/alertModel");
const { calculateFieldImpact, estimateImpact } = require("../services/impactAnalysis");

router.get("/", async (req, res) => {
  try {
    const { endpoint, method } = req.query;
    const userId = req.user.userId;
    const projectId = req.headers["x-project-id"];

    if (!projectId) {
      return res.status(400).json({ error: "Project ID missing" });
    }

    if (!endpoint || !method) {
      return res.status(400).json({
        error: "endpoint and method query params are required",
      });
    }

    const alerts = await getAlertsByEndpoint(
      endpoint,
      method,
      userId,
      projectId
    );

    const groupedMap = {};

    for (const a of alerts) {
      const key = `${a.change_type}-${a.field}`;

      if (!groupedMap[key]) {
        groupedMap[key] = {
          ...a,
          occurrence_count: a.occurrence_count || 1,
        };
      } else {
        groupedMap[key].occurrence_count +=
          a.occurrence_count || 1;
      }
    }

    const groupedAlerts = Object.values(groupedMap);

    const impact = await estimateImpact(
      endpoint,
      method,
      groupedAlerts,
      userId,
      projectId
    );

    const alertsWithImpact = await Promise.all(
      groupedAlerts.map(async (a) => {
        const field = a.field.replace("request.", "");

        const fieldImpact = await calculateFieldImpact(
          endpoint,
          method,
          field,
          userId,
          projectId
        );

        return {
          ...a,
          impact: fieldImpact,
        };
      })
    );

    res.json({
      alerts: alertsWithImpact,
      impact,
    });
  } catch (err) {
    console.error("Error fetching alerts:", err.message);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});
module.exports = router;