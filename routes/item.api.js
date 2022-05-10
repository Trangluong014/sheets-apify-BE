const express = require("express");
const { body } = require("express-validator");
const { createItem, getAllItem } = require("../controllers/item.controller");
const { loginRequired } = require("../middlewares/authentication");
const { isAdmin } = require("../middlewares/authorization");
const { validate } = require("../middlewares/validator");
const router = express.Router();

router.post("/create", loginRequired, createItem);

router.get("/:spreadsheetId", loginRequired, getAllItem);
module.exports = router;
