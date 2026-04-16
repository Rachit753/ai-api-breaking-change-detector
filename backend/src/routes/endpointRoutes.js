const express = require("express");
const router = express.Router();

const { getAllEndpoints } = require("../models/contractModel");

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const projectId = req.headers["x-project-id"];
    if (!projectId) {
      return res.status(400).json({ error: "Project ID missing" });}

    const endpoints = await getAllEndpoints(userId, projectId);

    res.json(endpoints);
  } catch (err) {
    console.error("Error fetching endpoints:", err.message);
    res.status(500).json({ error: "Failed to fetch endpoints" });
  }
});

module.exports = router;
