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
 * @constructor: req.body {Adminschema}
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
router.post(
  "/login",
  validate([
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userLogin
);
// 3. Admin can see a list of all admins in own website
// router.get("/all", loginRequired, adminList);
// 4. Admin can see other admin with same website's information by id
router.get(
  "profile/:id",

  validate([param("id").exists().isString().custom(checkObjectId)]),
  loginRequired,
  getSingleUserInfoById
);
// 5. Admin can see own user's information
router.get(
  "/me/profile",
  // validate([header("Authorization").exists().isString()]),
  loginRequired,
  getUserOwnInfo
);
// 6. Owner can update own account profile
router.put("/me/profile/update", loginRequired, updateUserAccount);
// 7. Owner can deactivate own account
router.delete("/me/deactivate", loginRequired, deactivateUserAccount);
// 8. Owner can update password
router.put("/me/profile/password", loginRequired, updateUserPassword);

module.exports = router;
