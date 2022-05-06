const express = require("express");
const router = express.Router();

const googleRoutes = require("./google.api");
router.use("/google", googleRoutes);

const adminRoutes = require("./admin.api");
router.use("/admin", adminRoutes);

const websiteRoutes = require("./website.api");
router.use("/website", websiteRoutes);

const userRoutes = require("./users.api.js");
router.use("/user", userRoutes);

module.exports = router;
