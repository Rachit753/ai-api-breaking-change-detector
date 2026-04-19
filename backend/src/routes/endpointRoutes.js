const express = require("express");
const router = express.Router();

const { getAllEndpoints } = require("../models/contractModel");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const projectId = req.headers["x-project-id"];
  if (!projectId) {
    return res.status(400).json({ error: "Project ID missing" });
  }

  const endpoints = await getAllEndpoints(userId, projectId);

  res.json(endpoints);
}));

module.exports = router;