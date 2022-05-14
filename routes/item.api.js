const express = require("express");
const { body } = require("express-validator");
const {
  createItem,
  getAllItem,
  deleteItem,
  getSingleItem,
} = require("../controllers/item.controller");
const { loginRequired } = require("../middlewares/authentication");
const { isAdmin } = require("../middlewares/authorization");
const { validate } = require("../middlewares/validator");
const router = express.Router();

router.post("/create/:spreadsheetId", loginRequired, createItem);

router.get("/:spreadsheetId", getAllItem);

router.get("/:spreadsheetId/:id", getSingleItem);

router.delete("/delete/:spreadsheetId", loginRequired, deleteItem);
module.exports = router;
