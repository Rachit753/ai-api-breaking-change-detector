const express = require("express");
const router = express.Router();

const { getAllEndpoints } = require("../models/contractModel");


router.get("/", async (req, res) => {
  try {
    const endpoints = await getAllEndpoints();
    res.json(endpoints);
  } catch (err) {
    console.error("Error fetching endpoints:", err.message);
    res.status(500).json({ error: "Failed to fetch endpoints" });
  }
});

module.exports = router;
