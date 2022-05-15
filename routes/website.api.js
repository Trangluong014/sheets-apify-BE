const express = require("express");
const { body } = require("express-validator");
const {
  createWebsite,
  getWebsitesList,
  getSingleWebsite,
  deleteWebsite,
} = require("../controllers/website.controller");

const { loginRequired } = require("../middlewares/authentication");
const { validate } = require("../middlewares/validator");
const router = express.Router();

router.post(
  "/create",
  validate([
    body("websiteId", "Invalid websiteId").exists().notEmpty(),
    body("name", "Invalid name").exists().notEmpty(),
    body("spreadsheetUrl", "Invalid url").exists().notEmpty(),
    body("template", "Invalid template").exists().notEmpty(),
    body("ranges", "Invalid ranges").exists().notEmpty(),
  ]),
  loginRequired,
  createWebsite
);

router.get("/", loginRequired, getWebsitesList);
router.get("/:websiteId", getSingleWebsite);
router.delete("/:websiteId", deleteWebsite);

// const { name, url, template, range } = req.body;
module.exports = router;
