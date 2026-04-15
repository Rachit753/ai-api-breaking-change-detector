const express = require("express");
const router = express.Router();
const supabase = require("../config/db");

router.get("/traffic", async (req, res) => {
  try {
    const userId = req.user.userId;
    const range = req.query.range || "24h";

    let fromTime = new Date();

    if (range === "1h") fromTime.setHours(fromTime.getHours() - 1);
    else if (range === "24h") fromTime.setHours(fromTime.getHours() - 24);
    else if (range === "7d") fromTime.setDate(fromTime.getDate() - 7);

    const { data, error } = await supabase
      .from("request_logs")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", fromTime.toISOString());

    if (error) throw error;

    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.created_at);

      const key =
        range === "7d"
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

      grouped[key] = (grouped[key] || 0) + 1;
    });

    const result = Object.keys(grouped).map((time) => ({
      time,
      requests: grouped[time],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Traffic failed" });
  }
});

router.get("/alerts-trend", async (req, res) => {
  try {
    const userId = req.user.userId;
    const range = req.query.range || "24h";

    let fromTime = new Date();

    if (range === "1h") fromTime.setHours(fromTime.getHours() - 1);
    else if (range === "24h") fromTime.setHours(fromTime.getHours() - 24);
    else if (range === "7d") fromTime.setDate(fromTime.getDate() - 7);

    const { data, error } = await supabase
      .from("alerts")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", fromTime.toISOString());

    if (error) throw error;

    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.created_at);

      const key =
        range === "7d"
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

      grouped[key] = (grouped[key] || 0) + 1;
    });

    const result = Object.keys(grouped).map((time) => ({
      time,
      alerts: grouped[time],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Alert trend failed" });
  }
});

router.get("/severity", async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("alerts")
      .select("severity")
      .eq("user_id", userId);

    if (error) throw error;

    const count = {
      BREAKING: 0,
      RISKY: 0,
      SAFE: 0,
    };

    data.forEach((a) => {
      count[a.severity]++;
    });

    const result = Object.keys(count).map((key) => ({
      name: key,
      value: count[key],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Severity failed" });
  }
});

router.get("/top-endpoints", async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("request_logs")
      .select("endpoint")
      .eq("user_id", userId);

    if (error) throw error;

    const count = {};

    data.forEach((r) => {
      count[r.endpoint] = (count[r.endpoint] || 0) + 1;
    });

    const result = Object.keys(count)
      .map((key) => ({
        endpoint: key,
        requests: count[key],
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Top endpoints failed" });
  }
});

router.get("/insights", async (req, res) => {
  try {
    const userId = req.user.userId;

    const insights = [];

    const { data: alerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userId);

    const { data: logs } = await supabase
      .from("request_logs")
      .select("*")
      .eq("user_id", userId);

    if (!alerts || !logs) {
      return res.json([]);
    }

    const breaking = alerts.filter((a) => a.severity === "BREAKING").length;

    if (breaking >= 3) {
      insights.push("High number of BREAKING changes detected");
    }

    if (logs.length >= 10) {
      insights.push("High API traffic detected recently");
    }

    const endpointCount = {};

    alerts.forEach((a) => {
      const key = `${a.endpoint}-${a.method}`;
      endpointCount[key] = (endpointCount[key] || 0) + 1;
    });

    Object.keys(endpointCount).forEach((key) => {
      if (endpointCount[key] >= 3) {
        insights.push(`Endpoint ${key} is unstable`);
      }
    });

    if (alerts.length === 0) {
      insights.push("System stable — no breaking changes detected");
    }

    res.json(insights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insights failed" });
  }
});

module.exports = router;