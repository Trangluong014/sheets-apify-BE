const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Item = require("../models/Item");
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
  let website = await Website.findOne({ spreadsheetId });
  if (website) {
    throw new AppError(
      409,
      "Website is already generated from this spreadsheet"
    );
  }
  let data = [];
  const itemList = await Item.find({ spreadsheetId });
  data = itemList.map((item) => item._id);
  const lastUpdate = Date.now();
  let dbLastUpdate = await getSheetLastUpdate(spreadsheetId);
  dbLastUpdate = Date.parse(dbLastUpdate.modifiedTime);

  website = await Website.create({
    author: admin._id,
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
