const mongoose = require("mongoose");
const {
  catchAsync,
  sendResponse,
  AppError,
  parseDynamic,
} = require("../helpers/utils");
const { db } = require("../models/Web");
const User = require("../models/User");
const Web = require("../models/Web");
const { getSheetLastUpdate, readData } = require("./googleapi.controller");

const webController = {};

//Create Website
webController.createWeb = catchAsync(async (req, res, next) => {
  const { name, url, template, range } = req.body;
  const { currentUserId } = req;

  let admin = await User.findById(currentUserId);

  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];
  let website = await Web.findOne({ spreadsheetId });
  if (website) {
    throw new AppError(
      409,
      "Website is already generated from this spreadsheet"
    );
  }
  const itemList = await db
    .collection("items")
    .find({ spreadsheetId })
    .toArray();
  data = itemList.map((item) => item._id);

  const lastUpdate = Date.now();
  let dbLastUpdate = await getSheetLastUpdate(spreadsheetId);
  dbLastUpdate = Date.parse(dbLastUpdate.modifiedTime);

  website = await Web.create({
    author: admin._id,
    name,
    spreadsheetId,
    range,
    template,
    data,
    lastUpdate,
    dbLastUpdate,
  });

  return sendResponse(
    res,
    200,
    true,
    { website },
    null,
    "Create Website success"
  );
});

// webController.getItems = catchAsync(async (req, res, next) => {
//   let { page, limit, sort, ...filter } = { ...req.query };
//   page = parseInt(page) || 1;
//   limit = parseInt(limit) || 10;
//   const { webId } = req.params;

//   const data = await Web.findById(webId).data;
//   const allowFilter = ["name", "category"];
//   allowFilter.forEach((field) => {
//     if (filter[field] !== undefined) {
//       filterCondition.push({
//         [field]: { $regex: filter[field], $options: "i" },
//       });
//     }
//   });
//   const filterCriteria = filterCondition.length
//     ? { $and: filterCondition }
//     : {};

//   let sortCondition = { createAt: -1 };
//   if (sort) {
//     if (sort === "priceasc") {
//       sortCondition = { ...sortCondition, price: -1 };
//     } else if (sort === "pricedsc") {
//       sortCondition = { ...sortCondition, price: 1 };
//     }
//   }

//   const sortCriteria = sortCondition.length ? sortCondition : {};

//   console.log("filter", filterCondition);

//   console.log("sort", sortCondition);
//   const count = await Product.countDocuments(filter);
//   const totalPage = Math.ceil(count / limit);
//   const offset = limit * (page - 1);

//   const productList = await Product.find(filterCriteria)
//     .sort(sortCriteria)
//     .skip(offset)
//     .limit(limit);

//   return sendResponse(
//     res,
//     200,
//     true,
//     { productList, totalPage },
//     null,
//     "Get Product Successfully"
//   );
// });

//Update data to Website

module.exports = webController;
