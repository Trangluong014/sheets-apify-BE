const { admin } = require("googleapis/build/src/apis/admin");
const { catchAsync, sendResponse } = require("../helpers/utils");
const Admin = require("../models/Admin");
const Website = require("../models/Website");
const { readData, getSheetLastUpdate } = require("./googleapi.controller");

const websiteController = {};

//Create Website
websiteController.createWebsite = catchAsync(async (req, res, next) => {
  const { name, url, template, range } = req.body;
  const { currentUserId } = req;

  let admin = await Admin.findById(currentUserId);

  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];

  const data = await readData(spreadsheetId, range);
  const lastUpdate = Date.now();
  let dbLastUpdate = await getSheetLastUpdate(spreadsheetId);
  dbLastUpdate = Date.parse(dbLastUpdate.modifiedTime);

  const website = await Website.create({
    name,
    spreadsheetId,
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

websiteController.updateWebsite = catchAsync(async (req, res, next) => {
  return sendResponse(res, 200, true, {}, null, "success");
});

module.exports = websiteController;
