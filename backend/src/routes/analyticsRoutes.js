const express = require("express");
const router = express.Router();
const supabase = require("../config/db");

router.get("/traffic", async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("request_logs")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.created_at);

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      const key = `${hours}:${minutes}`;

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