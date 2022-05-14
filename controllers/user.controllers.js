const bcrypt = require("bcryptjs");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const User = require("../models/User");

const userController = {};

// user can create account with email and password

userController.userRegister = catchAsync(async (req, res, next) => {
  let { name, email, password, websiteId, role } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    throw new AppError(409, "User already exits", "User register error");
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  user = await User.create({ name, email, password, websiteId, role });

  const accessToken = user.generateToken();

  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "User register success"
  );
});

// user can login with email and password

userController.userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }, "+password");

  if (!user) {
    throw new AppError(400, "User not found", "user Login Error");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(400, "Invalid credential", "user Login Error");
  }

  const accessToken = user.generateToken();

  return sendResponse(res, 200, true, { user, accessToken }, null, "success");
});

// User can see other User with same website's information by id

userController.getSingleUserInfoById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { currentUserId } = req;
  const currentUser = await User.findById(currentUserId);
  const user = await User.findOne({
    _id: id,
    websiteId: currentUser.websiteId,
  });
  if (!user) {
    throw new AppError(
      404,
      "User Not Found",
      "Get single User Information Error"
    );
  }

  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Get single User information success"
  );
});

// User can see own user's information

userController.getUserOwnInfo = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new AppError(404, "User Not Found", "Get user own information error");
  }

  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Get user own information success"
  );
});

// Owner can update own account profile

userController.updateUserAccount = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new AppError(404, "User Not Found", "Get user own information error");
  }
  const allows = ["name"];
  allows.forEach((field) => {
    if (req.body[field]) {
      user[field] = req.body[field];
    }
  });
  await user.save();
  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Update user Information success"
  );
});

// Owner can update password
userController.updateUserPassword = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;
  const user = await User.findById(currentUserId);
  let { newPassword, password } = req.body;
  if (!user) {
    throw new AppError(404, "User Not Found", "Get user own information error");
  }

  if (newPassword === password) {
    throw new AppError(
      404,
      "New Password must be different from current password, please change",
      "Update password error"
    );
  }

  const salt = await bcrypt.genSalt(10);
  newPassword = await bcrypt.hash(newPassword, salt);
  user.password = newPassword;

  await user.save();

  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "update user password success"
  );
});

// Owner can deactivate own account
userController.deactivateUserAccount = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;
  const user = await User.findByIdAndUpdate(
    currentUserId,
    { isDeleted: true },
    { new: true }
  );
  if (!user) {
    throw new AppError(404, "User Not Found", "Deactive user Account error");
  }

  return sendResponse(
    res,
    200,
    true,
    {},
    null,
    "deactivate user account success"
  );
});
// User can see list of their own websites.
userController.register = catchAsync(async (req, res, next) => {
  return sendResponse(res, 200, true, {}, null, "success");
});

module.exports = userController;
