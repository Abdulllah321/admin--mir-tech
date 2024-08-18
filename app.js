// app.js
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const { adminRoutes } = require("./routes/adminRoutes");
const projectRoutes = require("./routes/projectRoutes");
require("dotenv").config();
const app = express();
const methodOverride = require("method-override");

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

app.post("/test", (req, res) => {
  res.send(`Method: ${req.method}, _method: ${req.body._method}`);
});

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

// Error handling
app.use((req, res, next) => {
  res.status(404).send("404 Not Found");
});

app.listen(process.env.PORT, () => {
  console.log("Server is running on " + process.env.PORT);
});
