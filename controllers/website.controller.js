const { admin } = require("googleapis/build/src/apis/admin");
const { catchAsync, sendResponse } = require("../helpers/utils");
const Admin = require("../models/Admin");

const websiteController = {};

websiteController.createWebsite = catchAsync(async (req, res, next) => {
  const { name, url, template } = req.body;
  const { adminId } = req;

  const admin = await Admin.findById(admin);

  return sendResponse(res, 200, true, {}, null, "success");
});

websiteController.createWebsite = catchAsync(async (req, res, next) => {
  return sendResponse(res, 200, true, {}, null, "success");
});

websiteController.createWebsite = catchAsync(async (req, res, next) => {
  return sendResponse(res, 200, true, {}, null, "success");
});

websiteController.createWebsite = catchAsync(async (req, res, next) => {
  return sendResponse(res, 200, true, {}, null, "success");
});
