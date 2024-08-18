// routes/adminRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const Admin = require("../models/admin");
const project = require("../models/project");
const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect("/admin/login");
}

router.get("/login", (req, res) => {
  const error = req.query.error || null;
  res.render("login", { error });
});

router.post("/login-form", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    req.session.isAuthenticated = true;
    res.redirect("/");
  } else {
    res.redirect("/admin/login?error=Invalid username or password");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

module.exports = { ensureAuthenticated, adminRoutes: router };
 