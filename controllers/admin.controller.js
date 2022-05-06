const bcrypt = require("bcryptjs");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Admin = require("../models/Admin");

const adminController = {};

// Admin can create account with email and password

adminController.adminRegister = catchAsync(async (req, res, next) => {
  let { name, email, password } = req.body;

  let admin = await Admin.findOne({ email });

  if (admin) {
    throw new AppError(409, "User already exits", "Admin register error");
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  admin = await Admin.create({ name, email, password });

  const accessToken = admin.generateToken();

  return sendResponse(
    res,
    200,
    true,
    { admin, accessToken },
    null,
    "Admin register success"
  );
});

// Admin can login with email and password

adminController.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }, "+password");

  if (!admin) {
    throw new AppError(400, "User not found", "Admin Login Error");
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError(400, "Invalid credential", "Admin Login Error");
  }

  const accessToken = admin.generateToken();

  return sendResponse(res, 200, true, { user, accessToken }, null, "success");
});

// Admin can see a list of all admins in own website

adminController.adminList = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const { currentAdminId } = req;

  const admin = await Admin.findById({ currentAdminId });

  const filterCondition = [{ webId: admin.webId }];
  const allow = ["name", "email"];
  allow.forEach((field) => {
    if (filter[field]) {
      filterCondition.push({
        [field]: { $regex: filter[field], $option: "i" },
      });
    }
  });
  const filterCriteria = filterCondition.length
    ? { $and: filterCondition }
    : {};
  const count = await Admin.countDocuments(filterCriteria);
  const totalPage = Math.ceil(count / limit);
  const offset = limit * (page - 1);
  let adminList = await User.find(filterCriteria)
    .sort({ createAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { userList, totalPage },
    null,
    "Get Admin List success"
  );
});

// Admin can see other admin with same website's information by id

adminController.getSingleAdminInforById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { currentAdminId } = req;
  const currentAdmin = await Admin.findById({ currentAdminId });
  const admin = await Admin.findOne({ _id: id, webId: currentAdmin.webId });
  if (!admin) {
    throw new AppError(
      404,
      "User Not Found",
      "Get single Admin Information Error"
    );
  }

  return sendResponse(
    res,
    200,
    true,
    { admin },
    null,
    "Get single admin information success"
  );
});

// Admin can see own user's information

adminController.getAdminOwnInfor = catchAsync(async (req, res, next) => {
  const { currentAdminId } = req;
  const admin = await Admin.findById(currentAdminId);
  if (!admin) {
    throw new AppError(
      404,
      "User Not Found",
      "Get Admin own information error"
    );
  }

  return sendResponse(
    res,
    200,
    true,
    { admin },
    null,
    "Get Admin own information success"
  );
});

// Owner can update own account profile

adminController.UpdateAdminAccount = catchAsync(async (req, res, next) => {
  const { currentAdminId } = req;
  const admin = await Admin.findById(currentAdminId);
  if (!admin) {
    throw new AppError(
      404,
      "User Not Found",
      "Get Admin own information error"
    );
  }
  const allows = ["name"];
  allows.forEach((field) => {
    if (req.body[field]) {
      admin[field] = req.body[field];
    }
  });
  await admin.save();
  return sendResponse(
    res,
    200,
    true,
    { admin },
    null,
    "Update Admin Infor success"
  );
});

// Owner can update password
adminController.updateAdminPassword = catchAsync(async (req, res, next) => {
  const { currentAdminId } = req;
  const admin = await Admin.findById(currentAdminId);
  let { newPassword, password } = req.body;
  if (!admin) {
    throw new AppError(
      404,
      "User Not Found",
      "Get Admin own information error"
    );
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
  admin.password = newPassword;

  await admin.save();

  return sendResponse(
    res,
    200,
    true,
    { admin },
    null,
    "update admin password success"
  );
});

// Owner can deactivate own account
adminController.deactivateAdminAccount = catchAsync(async (req, res, next) => {
  const { currentAdminId } = req;
  const admin = await Admin.findByIdAndUpdate(
    currentAdminId,
    { isDeleted: true },
    { new: true }
  );
  if (!admin) {
    throw new AppError(404, "User Not Found", "Deactive Admin Account error");
  }

  return sendResponse(
    res,
    200,
    true,
    {},
    null,
    "deactivate admin account success"
  );
});

// Admin can see list of their own websites.
adminController.register = catchAsync(async (req, res, next) => {
  return sendResponse(res, 200, true, {}, null, "success");
});

module.exports = adminController;
