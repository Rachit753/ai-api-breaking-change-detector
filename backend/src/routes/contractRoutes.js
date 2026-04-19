const express = require("express");
const router = express.Router();

const { getContractsByEndpoint } = require("../models/contractModel");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(async (req, res) => {
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

  const contracts = await getContractsByEndpoint(
    endpoint,
    method,
    userId,
    projectId
  );

  res.json(contracts);
}));

module.exports = router;