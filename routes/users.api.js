const express = require("express");
const router = express.Router();
const { validate, checkObjectId } = require("../middlewares/validator");
const { body, param, header } = require("express-validator");
const {
  userRegister,
  userLogin,
  getUserOwnInfo,
  deactivateUserAccount,
  updateUserPassword,
  updateUserAccount,
} = require("../controllers/user.controllers");
const { loginRequired } = require("../middlewares/authentication");

// 1. User can create account with email and password
router.post(
  "/register",
  validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userRegister
);
// 2. User can login with email and password
router.post(
  "/login",
  validate([
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userLogin
);
// 3. Owner can see own user's information
router.get(
  "/profile",
  validate([header("authorization").exists().isString()]),
  loginRequired,
  getUserOwnInfo
);
// 4. Owner can update own account profile
router.put("/profile", loginRequired, updateUserAccount);
// 5. Owner can deactivate own account
router.delete("/deactivate", loginRequired, deactivateUserAccount);
// 6. Owner update password
router.put("/password", loginRequired, updateUserPassword);
module.exports = router;
