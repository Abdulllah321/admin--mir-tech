const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const { adminRoutes } = require("./routes/adminRoutes");
const projectRoutes = require("./routes/projectRoutes");
require("dotenv").config();
const app = express();
const methodOverride = require("method-override");
const cors = require("cors");
const NodeCache = require("node-cache"); // Import node-cache
const Project = require("./models/project");

// Initialize a new instance of node-cache
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Session middleware (for user sessions, if needed)
app.use(
  session({
    secret: "56165498sadadwq",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/admin", adminRoutes);
app.use("/", projectRoutes);

// API for fetching projects with caching using NodeCache
app.get("/api/project", async (req, res) => {
  try {
    // Destructure query parameter for filtering by category
    const { category } = req.query;

    // Build a cache key based on query parameters for unique caching
    const cacheKey = `projects:${category || "all"}`;

    // Check NodeCache cache first
    const cachedProjects = cache.get(cacheKey);
    if (cachedProjects) {
      console.log("Cache hit");
      return res.status(200).json(cachedProjects);
    }

    // Build filter object for MongoDB query
    const filter = category ? { category } : {};

    // Use lean queries for faster performance (no Mongoose document conversion)
    const projects = await Project.find(filter)
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .lean(); // Use lean for faster and memory-efficient results

    // Prepare the response data
    const response = {
      totalProjects: projects.length,
      projects,
    };

    cache.set(cacheKey, response);

    console.log("Cache miss");
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// Error handling
app.use((req, res, next) => {
  res.status(404).send("404 Not Found");
});

app.listen(process.env.PORT, () => {
  console.log("Server is running on " + process.env.PORT);
});
