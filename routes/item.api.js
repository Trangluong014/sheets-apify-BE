const express = require("express");
const { body } = require("express-validator");
const {
  createItem,
  getAllItem,
  deleteItem,
} = require("../controllers/item.controller");
const { loginRequired } = require("../middlewares/authentication");
const { isAdmin } = require("../middlewares/authorization");
const { validate } = require("../middlewares/validator");
const router = express.Router();

router.post("/:spreadsheetId/create", loginRequired, createItem);

router.get("/all/:spreadsheetId", getAllItem);

router.get("/:spreadsheetId/single/:id", getAllItem);

router.delete("/:spreadsheetId/delete", loginRequired, deleteItem);
module.exports = router;
