const express = require("express");
const { body } = require("express-validator");
const {
  createWebsite,
  getWebsitesList,
  getSingleWebsite,
} = require("../controllers/website.controller");

const { loginRequired } = require("../middlewares/authentication");
const { validate } = require("../middlewares/validator");
const router = express.Router();

router.post(
  "/create",
  validate([
    body("_id", "Invalid _id").exists().notEmpty(),
    body("name", "Invalid name").exists().notEmpty(),
    body("spreadsheetUrl", "Invalid url").exists().notEmpty(),
    body("template", "Invalid template").exists().notEmpty(),
    body("range", "Invalid range").exists().notEmpty(),
  ]),
  loginRequired,
  createWebsite
);

router.get("/", loginRequired, getWebsitesList);
router.get("/:websiteId", getSingleWebsite);

// const { name, url, template, range } = req.body;
module.exports = router;
