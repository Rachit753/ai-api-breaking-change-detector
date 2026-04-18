const express = require("express");
const router = express.Router();
const supabase = require("../config/db");
const { generateInsights } = require("../services/insightsService");

function generateTimeSlots(range) {
  const now = new Date();
  const slots = [];

  let interval;
  let totalSlots;

  if (range === "1h") {
    interval = 5;
    totalSlots = 12;
  } else if (range === "24h") {
    interval = 60;
    totalSlots = 24;
  } else {
    interval = 24 * 60;
    totalSlots = 7;
  }

  for (let i = totalSlots - 1; i >= 0; i--) {
    const date = new Date(now);

    if (range === "7d") {
      date.setDate(now.getDate() - i);
      slots.push(`${date.getDate()}/${date.getMonth() + 1}`);
    } else {
      date.setMinutes(now.getMinutes() - i * interval);
      slots.push(
        `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
      );
    }
  }

  return slots;
}

router.get("/traffic", async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.headers["x-project-id"];

    if (!projectId) {
      return res.status(400).json({ error: "Project ID missing" });
    }

    const range = req.query.range || "24h";

    let fromTime = new Date();
    if (range === "1h") fromTime.setHours(fromTime.getHours() - 1);
    else if (range === "24h") fromTime.setHours(fromTime.getHours() - 24);
    else if (range === "7d") fromTime.setDate(fromTime.getDate() - 7);

    const { data, error } = await supabase
      .from("request_logs")
      .select("created_at")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .gte("created_at", fromTime.toISOString());

    if (error) throw error;

    const slots = generateTimeSlots(range);
    const map = {};
    slots.forEach((s) => (map[s] = 0));

    data.forEach((item) => {
      const date = new Date(item.created_at);

      const key =
        range === "7d"
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

      if (map[key] !== undefined) map[key]++;
    });

    res.json(
      slots.map((time) => ({
        time,
        requests: map[time],
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Traffic failed" });
  }
});

router.get("/alerts-trend", async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.headers["x-project-id"];

    if (!projectId) {
      return res.status(400).json({ error: "Project ID missing" });
    }

    const range = req.query.range || "24h";

    let fromTime = new Date();
    if (range === "1h") fromTime.setHours(fromTime.getHours() - 1);
    else if (range === "24h") fromTime.setHours(fromTime.getHours() - 24);
    else if (range === "7d") fromTime.setDate(fromTime.getDate() - 7);

    const { data, error } = await supabase
      .from("alerts")
      .select("created_at")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .gte("created_at", fromTime.toISOString());

    if (error) throw error;

    const slots = generateTimeSlots(range);
    const map = {};
    slots.forEach((s) => (map[s] = 0));

    data.forEach((item) => {
      const date = new Date(item.created_at);

      const key =
        range === "7d"
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

      if (map[key] !== undefined) map[key]++;
    });

    res.json(
      slots.map((time) => ({
        time,
        alerts: map[time],
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Alert trend failed" });
  }
});

router.get("/severity", async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.headers["x-project-id"];

    if (!projectId) {
      return res.status(400).json({ error: "Project ID missing" });
    }

    const { data, error } = await supabase
      .from("alerts")
      .select("severity")
      .eq("user_id", userId)
      .eq("project_id", projectId);

    if (error) throw error;

    const count = { BREAKING: 0, RISKY: 0, SAFE: 0 };

    data.forEach((a) => {
      count[a.severity]++;
    });

    res.json(
      Object.keys(count).map((key) => ({
        name: key,
        value: count[key],
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Severity failed" });
  }
});

router.get("/top-endpoints", async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.headers["x-project-id"];

    if (!projectId) {
      return res.status(400).json({ error: "Project ID missing" });
    }

    const { data, error } = await supabase
      .from("request_logs")
      .select("endpoint")
      .eq("user_id", userId)
      .eq("project_id", projectId);

    if (error) throw error;

    const count = {};

    data.forEach((r) => {
      
      const cleanEndpoint = (r.endpoint || "")
        .replace(/^\/api/, "")
        .trim();

      count[cleanEndpoint] = (count[cleanEndpoint] || 0) + 1;
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
    console.error(err);
    res.status(500).json({ error: "Top endpoints failed" });
  }
});

router.get("/insights", async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.headers["x-project-id"];

    if (!projectId) {
      return res.status(400).json({ error: "Project ID missing" });
    }

    const result = await generateInsights(userId, projectId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insights failed" });
  }
});

router.get("/field-usage", async (req, res) => {
  try {
    const projectId = req.headers["x-project-id"];

    if (!projectId) {
      return res.status(400).json({ error: "Missing project ID" });
    }

    const { data, error } = await supabase
      .from("field_usage")
      .select("field, count")
      .eq("project_id", projectId);

    if (error) throw error;

    const map = {};

    data.forEach((row) => {
      const cleanField = (row.field || "")
        .replace("request.", "")
        .replace("response.", "")
        .trim();

      map[cleanField] = (map[cleanField] || 0) + row.count;
    });

    res.json(
      Object.entries(map).map(([field, count]) => ({
        field,
        count,
      }))
    );
  } catch (err) {
    console.error("Field usage error:", err);
    res.status(500).json({ error: "Failed to fetch field usage" });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.headers["x-project-id"];

    if (!projectId) {
      return res.status(400).json({ error: "Project ID missing" });
    }

    const limit = parseInt(req.query.limit) || 50;

    const { data, error } = await supabase
      .from("request_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Logs fetch error:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;