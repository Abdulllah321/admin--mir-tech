const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const multer = require("multer");
const path = require("path");
const admin = require("../models/admin");
const { ensureAuthenticated } = require("./adminRoutes");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const projects = await Project.find({});
    const admins = await admin.find({});
    res.render("index", { projects, admins });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server Error");
  }
});
router.get("/test", ensureAuthenticated, async (req, res) => {
  try {
    const projects = await Project.find({});
    const admins = await admin.find({});
    res.render("test", { projects, admins });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/project-form/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send("Project not found");
    }
    res.render("project-form", { project, isEdit: true });
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).send(err.message);
  }
});

router.get("/project-form", (req, res) => {
  res.render("project-form", { isEdit: false });
});

router.post("/projects", upload.single("image"), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    let imageUrl = "";

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newProject = new Project({
      title,
      description,
      category,
      imageUrl,
    });

    await newProject.save();
    res.redirect("/");
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).send(err.message);
  }
});

router.post("/projects/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).send("Project not found");
    }

    project.title = title;
    project.description = description;
    project.category = category;

    if (req.file) {
      project.imageUrl = `/uploads/${req.file.filename}`;
    }

    await project.save();
    res.redirect("/");
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).send(err.message);
  }
});

// Handle project deletion
router.delete("/projects/:id", async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send("Project not found");
    }
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
