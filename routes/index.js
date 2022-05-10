const express = require("express");
const router = express.Router();
const cool = require("cool-ascii-faces");

router.get("/cool", (req, res) => res.send(cool()));
const googleRoutes = require("./google.api");
router.use("/google", googleRoutes);

const adminRoutes = require("./admin.api");
router.use("/admin", adminRoutes);

const websiteRoutes = require("./website.api");
router.use("/website", websiteRoutes);

const webRoutes = require("./web.api");
router.use("/web", webRoutes);

const itemRoutes = require("./item.api");
router.use("/item", itemRoutes);

const productRoutes = require("./product.api");
router.use("/product", productRoutes);

const userRoutes = require("./users.api.js");
router.use("/user", userRoutes);

module.exports = router;
