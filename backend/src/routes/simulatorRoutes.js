const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

router.post("/", async (req, res) => {
  try {
    const { url, method, body } = req.body;

    if (!url || !method) {
      return res.status(400).json({ error: "URL and method required" });
    }

    const endpointPath = new URL(url).pathname;
    req.headers["x-actual-endpoint"] = endpointPath;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
        "x-project-id": req.headers["x-project-id"] || "",
        "x-internal-call": "true",
      },
      body: method !== "GET" ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    res.json({
      status: response.status,
      data,
    });
  } catch (err) {
    console.error("Simulator error:", err);
    res.status(500).json({ error: "Simulator failed" });
  }
});

module.exports = router;