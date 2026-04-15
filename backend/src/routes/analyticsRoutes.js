const express = require("express");
const router = express.Router();
const supabase = require("../config/db");

function getFromTime(range) {
  const fromTime = new Date();

  if (range === "1h") fromTime.setHours(fromTime.getHours() - 1);
  else if (range === "24h") fromTime.setHours(fromTime.getHours() - 24);
  else if (range === "7d") fromTime.setDate(fromTime.getDate() - 7);

  return fromTime.toISOString();
}

router.get("/traffic", async (req, res) => {
  try {
    const userId = req.user.userId;
    const range = req.query.range || "24h";
    const fromTime = getFromTime(range);

    const { data, error } = await supabase
      .from("request_logs")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", fromTime);

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

    res.json(
      Object.keys(grouped).map((time) => ({
        time,
        requests: grouped[time],
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Traffic failed" });
  }
});

router.get("/alerts-trend", async (req, res) => {
  try {
    const userId = req.user.userId;
    const range = req.query.range || "24h";
    const fromTime = getFromTime(range);

    const { data, error } = await supabase
      .from("alerts")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", fromTime);

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

    res.json(
      Object.keys(grouped).map((time) => ({
        time,
        alerts: grouped[time],
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Alert trend failed" });
  }
});

router.get("/severity", async (req, res) => {
  try {
    const userId = req.user.userId;
    const range = req.query.range || "24h";
    const fromTime = getFromTime(range);

    const { data, error } = await supabase
      .from("alerts")
      .select("severity")
      .eq("user_id", userId)
      .gte("created_at", fromTime);

    if (error) throw error;

    const count = { BREAKING: 0, RISKY: 0, SAFE: 0 };

    data.forEach((a) => {
      if (count[a.severity] !== undefined) {
        count[a.severity]++;
      }
    });

    res.json(
      Object.keys(count).map((k) => ({
        name: k,
        value: count[k],
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Severity failed" });
  }
});

router.get("/top-endpoints", async (req, res) => {
  try {
    const userId = req.user.userId;
    const range = req.query.range || "24h";
    const fromTime = getFromTime(range);

    const { data, error } = await supabase
      .from("request_logs")
      .select("endpoint, created_at")
      .eq("user_id", userId)
      .gte("created_at", fromTime);

    if (error) throw error;

    const count = {};

    data.forEach((r) => {
      count[r.endpoint] = (count[r.endpoint] || 0) + 1;
    });

    res.json(
      Object.keys(count)
        .map((key) => ({
          endpoint: key,
          requests: count[key],
        }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5)
    );
  } catch (err) {
    res.status(500).json({ error: "Top endpoints failed" });
  }
});

module.exports = router;