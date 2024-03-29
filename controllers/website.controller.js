const { defaultConfiguration } = require("express/lib/application");
const { admin } = require("googleapis/build/src/apis/admin");
const mongoose = require("mongoose");
const {
  catchAsync,
  sendResponse,
  AppError,
  parseDynamic,
} = require("../helpers/utils");

const db = mongoose.connection;
const User = require("../models/User");
const Website = require("../models/Website");
const { getSheetLastUpdate, readData } = require("./googleapi.controller");
const itemController = require("./item.controller");
const { createItem, updateItemList } = require("./item.controller");

const websiteController = {};

//Create Website
websiteController.createWebsite = catchAsync(async (req, res, next) => {
  const { name, spreadsheetUrl, template, ranges, websiteId, config } =
    req.body;
  const { currentUserId } = req;

  let admin = await User.findById(currentUserId);

  const urlSpilt = spreadsheetUrl.split("/");
  const spreadsheetId = urlSpilt[5];
  let website = await Website.findOne({ spreadsheetId });
  if (website) {
    throw new AppError(
      409,
      "Website is already generated from this spreadsheet"
    );
  }
  website = await Website.findOne({ websiteId });
  if (website) {
    throw new AppError(409, "Website Id must be unique");
  }

  const lastUpdate = Date.now();
  let dbLastUpdate = await getSheetLastUpdate(spreadsheetId);
  dbLastUpdate = Date.parse(dbLastUpdate.modifiedTime);

  const session = await mongoose.startSession();
  db.startSession();
  website = await Website.create({
    config,
    websiteId,
    author: admin._id,
    name,
    spreadsheetId,
    ranges,
    template,
    lastUpdate,
    dbLastUpdate,
  });

  console.log(website.ranges);
  let rangeHeaders = {};
  const promises = website.ranges.map(async (range) => {
    const header = await createItem(range, currentUserId, spreadsheetId);

    rangeHeaders = { ...rangeHeaders, [range]: header };
  });

  await Promise.all(promises);
  website.rangeHeaders = rangeHeaders;
  await website.save();
  admin.webId.push(websiteId);
  await admin.save();

  session.endSession();

  return sendResponse(res, 200, true, { website }, null, "Create Website done");
});

websiteController.getWebsitesList = catchAsync(async (req, res, next) => {
  let { page, limit } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const { currentUserId } = req;

  const count = await Website.countDocuments({ author: currentUserId });
  const totalPage = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const websiteList = await Website.find({ author: currentUserId })
    .sort({ createAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(
    res,
    200,
    true,
    { websiteList, totalPage },
    null,
    "Get Website List done"
  );
});

websiteController.getSingleWebsite = catchAsync(async (req, res, next) => {
  const { websiteId } = req.params;
  console.log(websiteId);

  const website = await Website.findOne({ websiteId });

  if (!website) {
    throw new AppError(404, "Website not found");
  }

  return sendResponse(res, 200, true, { website }, null, "Get Single Web done");
});

websiteController.updateWebsite = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;
  const { websiteId } = req.params;

  let admin = await User.findById(currentUserId);

  if (!admin) {
    throw new AppError(404, "User Not Found", "Update Website Error");
  }
  const website = await Website.findOne({ websiteId });
  if (!website) {
    throw new AppError(404, "Website not found");
  }
  const { spreadsheetId } = website;
  console.log("body", req.body);
  const allows = ["name", "ranges", "config"];
  const promises = allows.map(async (field) => {
    if (req.body[field]) {
      if (req.body.ranges) {
        const { ranges } = req.body;
        console.log(ranges);
        ///add new ranges
        let addRanges = ranges.filter((x) => !website.ranges.includes(x));

        if (addRanges) {
          console.log("new range", addRanges);
          const promise1 = addRanges.map(async (range) => {
            const header = await createItem(
              range,
              currentUserId,
              spreadsheetId
            );

            website.rangeHeaders = { ...website.rangeHeaders, [range]: header };
            console.log(website.rangeHeaders);
          });

          await Promise.all(promise1);
        }

        let subRanges = website.ranges.filter((x) => !ranges.includes(x));

        if (subRanges) {
          console.log("old range", subRanges);
          const promise2 = subRanges.map(async (range) => {
            console.log(range);
            console.log({
              $and: [{ spreadsheetId: website.spreadsheetId }, { range }],
            });
            await db.collection("items").deleteMany({
              $and: [{ spreadsheetId: website.spreadsheetId }, { range }],
            });
            console.log(website.rangeHeaders[range]);
            delete website.rangeHeaders[range];
          });
          await Promise.all(promise2);
        }
      }

      website[field] = req.body[field];
      console.log(website);
    }
  });
  await Promise.all(promises);
  console.log("here");
  await website.save();

  return sendResponse(res, 200, true, { website }, null, "Update Website done");
});

websiteController.deleteWebsite = catchAsync(async (req, res, next) => {
  const { websiteId } = req.params;
  console.log(websiteId);
  const { currentUserId } = req;

  const admin = await User.findById(currentUserId);

  const website = await Website.findOneAndDelete({ websiteId });
  const spreadsheetId = website.spreadsheetId;
  await db.collection("items").deleteMany({ spreadsheetId });
  admin.webId = admin.webId.filter((e) => e !== websiteId);
  await admin.save();

  if (!website) {
    throw new AppError(404, "Website not found");
  }

  return sendResponse(res, 200, true, { website }, null, "Delete Web done");
});

//Update data to Website

module.exports = websiteController;
