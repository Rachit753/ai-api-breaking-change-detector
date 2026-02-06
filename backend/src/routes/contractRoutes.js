const express = require("express");
const router = express.Router();

const { getContractsByEndpoint } = require("../models/contractModel");

/**
 * GET /api/contracts?endpoint=/test-user&method=POST
 * Returns contract version history for an endpoint
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

    const contracts = await getContractsByEndpoint(endpoint, method);
    res.json(contracts);
  } catch (err) {
    console.error("Error fetching contracts:", err.message);
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
});

module.exports = router;
