const { catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const { readData, getSheetLastUpdate } = require("./googleapi.controller");

const productController = {};

//Create Website
productController.createProduct = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;

  let admin = await User.findById(currentUserId);

  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];

  let data = await readData(spreadsheetId, range);
  data.forEach();

  return sendResponse(
    res,
    200,
    true,
    { website },
    null,
    "Create Website success"
  );
});

//Update data to Website

module.exports = websiteController;
