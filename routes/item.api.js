const express = require("express");
const { body } = require("express-validator");
const {
  createItem,
  getAllItem,
  deleteItem,
  getSingleItem,
  updateItemList,
} = require("../controllers/item.controller");
const { loginRequired } = require("../middlewares/authentication");
const { isAdmin } = require("../middlewares/authorization");
const { validate } = require("../middlewares/validator");
const router = express.Router();

// 1. Get all Items of a website with sort, search, filter, pagination

/**
 * @method: Get
 * @access: Public
 * @description: Get all Items of a Website
 * @constructor: req.params
 */

router.get("/:spreadsheetId", getAllItem);

// 2. Get single Item of a website

/**
 * @method: Get
 * @access: Public
 * @description: Get single Items of a Website
 * @constructor: req.params
 */

router.get("/:spreadsheetId/:range/:rowIndex", getSingleItem);

module.exports = router;
