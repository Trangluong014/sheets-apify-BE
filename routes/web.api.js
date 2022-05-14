const express = require("express");
const { body } = require("express-validator");
const {
  createWeb,
  getWebList,
  getSingleWeb,
} = require("../controllers/web.controller");
const { loginRequired } = require("../middlewares/authentication");
const { validate } = require("../middlewares/validator");
const router = express.Router();

router.post(
  "/create",
  validate([
    body("_id", "Invalid _id").exists().notEmpty(),
    body("name", "Invalid name").exists().notEmpty(),
    body("url", "Invalid url").exists().notEmpty(),
    body("template", "Invalid template").exists().notEmpty(),
    body("range", "Invalid range").exists().notEmpty(),
  ]),
  loginRequired,
  createWeb
);

router.get("/", loginRequired, getWebList);
router.get("/:websiteId", getSingleWeb);

// const { name, url, template, range } = req.body;
module.exports = router;
