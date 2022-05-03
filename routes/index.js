const express = require("express");
const router = express.Router();

const googleRoutes = require("./google.api");
router.use("/googles", googleRoutes);

const adminRoutes = require("./admin.api");
router.use("/admins", adminRoutes);

const websiteRoutes = require("./website.api");
router.use("/websites", websiteRoutes);

const userRoutes = require("./users.api.js");
router.use("/users", userRoutes);

module.exports = router;
