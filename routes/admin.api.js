const express = require("express");
const {
  adminRegister,
  adminLogin,
  adminList,
  getSingleAdminInfoById,
  getAdminOwnInfo,
  UpdateAdminAccount,
  deactivateAdminAccount,
  updateAdminPassword,
} = require("../controllers/admin.controller");
const router = express.Router();
const { validate, checkObjectId } = require("../middlewares/validator");
const { body, param, header } = require("express-validator");
const { loginRequired } = require("../middlewares/authentication");

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
  adminRegister
);
// 2. Admin can login with email and password
router.post(
  "/login",
  validate([
    body("email,Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  adminLogin
);
// 3. Admin can see a list of all admins in own website
router.get("/all", loginRequired, adminList);
// 4. Admin can see other admin with same website's information by id
router.get(
  "/:id",

  validate([param("id").exists().isString().custom(checkObjectId)]),
  loginRequired,
  getSingleAdminInfoById
);
// 5. Admin can see own user's information
router.get(
  "/profile",
  validate([header("authorization").exists().isString()]),
  loginRequired,
  getAdminOwnInfo
);
// 6. Owner can update own account profile
router.put("/profile/update", loginRequired, UpdateAdminAccount);
// 7. Owner can deactivate own account
router.delete("/profile/deactivate", loginRequired, deactivateAdminAccount);
// 8. Owner can update password
router.put("/profile/password", loginRequired, updateAdminPassword);
module.exports = router;
