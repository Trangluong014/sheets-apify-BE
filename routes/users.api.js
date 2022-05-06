const express = require("express");
const router = express.Router();

// 1. User can create account with email and password
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
// 2. User can login with email and password
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
// 3. Owner can see own user's information
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
// 4. Owner can update own account profile
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
// 5. Owner can deactivate own account
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
// 6. Owner update password
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
module.exports = router;
