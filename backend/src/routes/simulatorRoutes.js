const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const asyncHandler = require("../utils/asyncHandler");

router.post("/", asyncHandler(async (req, res) => {
  const { url, method, body } = req.body;

  if (!url || !method) {
    return res.status(400).json({ error: "URL and method required" });
  }

  const endpointPath = new URL(url).pathname;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.authorization || "",
      "x-project-id": req.headers["x-project-id"] || "",
      "x-internal-call": "true",
      "x-actual-endpoint": endpointPath,
    },
    body: method !== "GET" ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  res.json({
    status: response.status,
    data,
  });
}));

module.exports = router;