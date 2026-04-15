const express = require("express");
const router = express.Router();
const supabase = require("../config/db");

router.get("/traffic", async (req, res) => {
  try {
    const userId = req.user.userId;
    const range = req.query.range || "24h";

    let fromTime = new Date();

    if (range === "1h") {
      fromTime.setHours(fromTime.getHours() - 1);
    } else if (range === "24h") {
      fromTime.setHours(fromTime.getHours() - 24);
    } else if (range === "7d") {
      fromTime.setDate(fromTime.getDate() - 7);
    }

    const { data, error } = await supabase
      .from("request_logs")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", fromTime.toISOString())
      .order("created_at", { ascending: true });

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
    console.error("Analytics error:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;