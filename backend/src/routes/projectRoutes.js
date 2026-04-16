const express = require("express");
const router = express.Router();

const { createProject, getProjects } = require("../models/projectModel");

router.post("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    const project = await createProject(name, userId);

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const projects = await getProjects(userId);

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

module.exports = router;