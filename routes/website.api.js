const express = require("express");
const { body } = require("express-validator");
const { updateItemList } = require("../controllers/item.controller");
const {
  createWebsite,
  getWebsitesList,
  getSingleWebsite,
  deleteWebsite,
  updateWebsite,
} = require("../controllers/website.controller");

const { loginRequired } = require("../middlewares/authentication");
const { validate } = require("../middlewares/validator");
const router = express.Router();

// 1. Create Website and Items belong to the website

/**
 * @method: Post
 * @access: Login Required
 * @description: Create Website and Items belong to the website
 * @constructor: req.body
 */
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

// 2. Get List of Websites with information of each website

/**
 * @method: Get
 * @access: Login Required
 * @description: Get List of Websites with information of each website
 * @constructor: req.body
 */
router.get("/", loginRequired, getWebsitesList);
// 3. Get single website with information

/**
 * @method: Get
 * @access: Public
 * @description: Get single website with information
 * @constructor: req.params
 */
router.get("/:websiteId", getSingleWebsite);

// 4. Owner can delete own Website and all data belong to this website.

/**
 * @method: delete
 * @access: Login Required
 * @description: Delete own website
 * @constructor: req.params
 */
router.delete("/:websiteId", loginRequired, deleteWebsite);

// 5. Owner can update own Website information

/**
 * @method: patch
 * @access: Login Required
 * @description: Update Own Website information
 * @constructor: req.params
 */
router.patch("/:websiteId", loginRequired, updateWebsite);

// 2. Owner can update own Website data

/**
 * @method: patch
 * @access: Login Required
 * @description: Update own Website data
 * @constructor: req.params
 */
router.post("/:websiteId/update", loginRequired, updateItemList);

// const { name, url, template, range } = req.body;
module.exports = router;
