const { catchAsync, sendResponse } = require("../helpers/utils");
const Admin = require("../models/Admin");
const Product = require("../models/Product");
const User = require("../models/User");
const Website = require("../models/Website");
const { getSheetLastUpdate } = require("./googleapi.controller");

const websiteController = {};

//Create Website
websiteController.createWebsite = catchAsync(async (req, res, next) => {
  const { name, url, template, range } = req.body;
  const { currentUserId } = req;

  let admin = await User.findById(currentUserId);

  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];

  let data = [];
  const productList = await Product.find({ spreadsheetId });
  data = productList.map((product) => product._id);
  const lastUpdate = Date.now();
  let dbLastUpdate = await getSheetLastUpdate(spreadsheetId);
  dbLastUpdate = Date.parse(dbLastUpdate.modifiedTime);

  const website = await Website.create({
    name,
    spreadsheetId,
    range,
    template,
    data,
    lastUpdate,
    dbLastUpdate,
  });

  await admin.updateOne({ webId: website._id });
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
