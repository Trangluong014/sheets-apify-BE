const express = require("express");
const { body } = require("express-validator");
const { createProduct } = require("../controllers/product.controller");
const { createWebsite } = require("../controllers/website.controller");
const { loginRequired } = require("../middlewares/authentication");
const { validate } = require("../middlewares/validator");
const router = express.Router();

router.post("/create", loginRequired, createProduct);

// const { name, url, template, range } = req.body;
module.exports = router;
