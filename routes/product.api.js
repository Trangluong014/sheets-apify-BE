const express = require("express");
const { body } = require("express-validator");
const {
  createProduct,
  getAllProduct,
} = require("../controllers/product.controller");
const { loginRequired } = require("../middlewares/authentication");
const { isAdmin } = require("../middlewares/authorization");
const { validate } = require("../middlewares/validator");
const router = express.Router();

router.post("/create", loginRequired, createProduct);

router.get("/:spreadsheetId", loginRequired, getAllProduct);
module.exports = router;
