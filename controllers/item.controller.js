const mongoose = require("mongoose");
const { catchAsync, sendResponse, parseDynamic } = require("../helpers/utils");
const { db } = require("../models/Web");

const User = require("../models/User");
const { readData } = require("./googleapi.controller");

const itemController = {};

//Create Items

itemController.createItem = catchAsync(async (req, res, next) => {
  const { url, range } = req.body;
  const { currentUserId } = req;

  let admin = await User.findById(currentUserId);

  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];
  let data = await readData(spreadsheetId, range);
  let header = data[0];
  console.log("header", header);
  data = data.slice(1).map((e, index) => {
    const obj = {};
    for (let i = 0; i < e.length; i++) {
      obj.author = admin._id;
      obj.spreadsheetId = spreadsheetId;
      obj[header[i].toLowerCase()] = parseDynamic(e[i]);
    }
    return obj;
  });
  console.log("data", data);

  db.collection("items").insertMany(data);

  return sendResponse(res, 200, true, {}, null, "Create Items success");
});
itemController.getAllItem = catchAsync(async (req, res, next) => {
  let { page, limit, sort, order, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const { spreadsheetId } = req.params;

  console.log("sort", sort);
  console.log("order", order);
  const filterCondition = [{ spreadsheetId }];
  const allowFilter = ["name", "category"];
  allowFilter.forEach((field) => {
    if (filter[field] !== undefined) {
      filterCondition.push({
        [[field]]: filter[field],
      });
    }
  });
  const filterCriteria = filterCondition.length
    ? { $and: filterCondition }
    : {};

  let sortCondition = { createAt: -1 };
  if (sort) {
    if (order === "asc") {
      sortCondition = { [sort]: -1 };
    } else if (order === "dsc") {
      sortCondition = { [sort]: 1 };
    }
  }

  console.log("filter", filterCriteria);

  console.log("sort", sortCondition);
  const count = await db.collection("items").countDocuments(filter);
  const totalPage = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const itemList = await db
    .collection("items")
    .find(filterCriteria)
    .sort(sortCondition)
    .skip(offset)
    .limit(limit)
    .toArray();
  return sendResponse(
    res,
    200,
    true,
    { itemList, totalPage },
    null,
    "Get Item Successfully"
  );
});

itemController.deleteItem = catchAsync(async (req, res, next) => {
  const { spreadsheetId } = req.params;
  const { currentUserId } = req;

  db.collection("items").deleteMany({ spreadsheetId });

  return sendResponse(res, 200, true, {}, null, "Delete Items success");
});

module.exports = itemController;
