const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const multer = require("multer");
const path = require("path");
const admin = require("../models/admin");
const { ensureAuthenticated } = require("./adminRoutes");

const NodeCache = require("node-cache");
const cache = new NodeCache(); // Initialize cache

// Function to clear cache
const clearCache = (key = "projects_cache") => {
  try {
    cache.del(key); // Clears cache for 'projects_cache' key
    console.log(`Cache cleared for ${key}.`);
  } catch (err) {
    console.error("Error clearing cache:", err);
  }
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
const uploadMultiple = multer({ storage: storage }).array("images", 50);

// Routes
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

router.post("/projects/multiple", uploadMultiple, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded");
    }

    const projects = req.files.map((file) => ({
      title: title || "Untitled Project",
      description: description || "No description provided",
      category: "graphic",
      imageUrl: `/uploads/${file.filename}`,
    }));

    await Project.insertMany(projects);
    clearCache(); // Clear the cache after creating a new project

    res.redirect("/");
  } catch (err) {
    console.error("Error creating multiple projects:", err);
    res.status(500).send(err.message);
  }
});

router.get("/projects/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const projects = await Project.find({ category });

    if (projects.length === 0) {
      return res.status(404).send("No projects found for this category");
    }
    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects by category:", err);
    res.status(500).send(err.message);
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

router.get("/multiple", (req, res) => {
  res.render("multiple");
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
    clearCache(); // Clear the cache after creating a new project

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
      clearCache();  
 // Clear the cache after updating the project

    res.redirect("/");
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).send(err.message);
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send("Project not found");
    }

      clearCache();  
 // Clear the cache after deleting a project

    res.status(200).send("ok");
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
