const express = require("express");
const router = express.Router();
const { validate, checkObjectId } = require("../middlewares/validator");
const { body, param, header } = require("express-validator");
const { loginRequired } = require("../middlewares/authentication");
const {
  userRegister,
  userLogin,
  getSingleUserInfoById,
  getUserOwnInfo,
  UpdateUserAccount,
  deactivateUserAccount,
  updateUserPassword,
  updateUserAccount,
} = require("../controllers/user.controllers");
const { isAdmin } = require("../middlewares/authorization");

// 1. Admin can create account with email and password
/**
 * @method: POST
 * @access: Public
 * @description: Create new user document in User collection
 * @constructor: req.body {Userschema}
 */

router.post(
  "/register",
  validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userRegister
);
// 2. Admin can login with email and password

/**
 * @method: POST
 * @access: Public
 * @description: Login with user email and password
 * @constructor: req.body {Userschema}
 */
router.post(
  "/login",
  validate([
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userLogin
);

// 3. Admin can see own user's information
/**
 * @method: Get
 * @access: Login Required
 * @description: Get User Own information
 */
router.get(
  "/profile",
  validate([header("Authorization").exists().isString()]),
  loginRequired,
  getUserOwnInfo
);
// 4. Owner can update own account profile
/**
 * @method: Put
 * @access: Login Required
 * @description: Update Avatar, Name and some other information
 */
router.put("/profile", loginRequired, updateUserAccount);
// 5. Owner can deactivate own account
/**
 * @method: Delete
 * @access: Login Required
 * @description: Deactive User Account
 */
router.delete("/deactivate", loginRequired, deactivateUserAccount);
// 6. Owner can update password

/**
 * @method: Put
 * @access: Login Required
 * @description: Deactive User Account
 */
router.put("/password", loginRequired, updateUserPassword);

module.exports = router;
