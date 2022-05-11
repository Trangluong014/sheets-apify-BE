const mongoose = require("mongoose");
const { catchAsync, sendResponse, parseDynamic } = require("../helpers/utils");
// const { db } = require("../models/Web");

const User = require("../models/User");
const { readData } = require("./googleapi.controller");

const itemController = {};
const DELIMITER = "__";

const db = mongoose.connection;
//Create Items

itemController.createItem = catchAsync(async (req, res, next) => {
  const { range } = req.body;
  const { currentUserId } = req;
  const { spreadsheetId } = req.params;

  let admin = await User.findById(currentUserId);

  let data = await readData(spreadsheetId, range);
  let header = data[0];
  console.log("header", header);
  data = data.slice(1).map((e, index) => {
    const obj = {};
    for (let i = 0; i < e.length; i++) {
      obj.author = admin._id;
      obj.spreadsheetId = spreadsheetId;
      obj.rowIndex = index;
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

  if (filter) {
    const withDelimiter = Object.keys(filter)
      .filter((key) => key.indexOf(DELIMITER) > -1)
      .map((key) => {
        const segment = key.split(DELIMITER);
        const operator = segment[segment.length - 1];
        segment.pop();
        const field = segment.join(DELIMITER);
        return [field, operator, key];
      });
    const noDelimiter = Object.keys(filter).filter(
      (key) => key.indexOf(DELIMITER) === -1
    );

    if (noDelimiter) {
      noDelimiter.forEach((item) => {
        filterCondition.push({
          [item]: parseDynamic(filter[item]),
        });
      });
    }
    if (withDelimiter) {
      withDelimiter.forEach(([item1, item2, item3]) => {
        filterCondition.push({
          [item1]: {
            [`$${item2}`]: parseDynamic(filter[item3]),
          },
        });
      });
    }
  }

  console.log("filter", filter);
  const filterCriteria = filterCondition.length
    ? { $and: filterCondition }
    : {};

  let sortCondition = { createAt: -1 };
  if (sort) {
    if (order === "asc") {
      sortCondition = { [sort]: 1 };
    } else if (order === "dsc") {
      sortCondition = { [sort]: -1 };
    }
  }

  console.log("filter", filterCriteria);

  console.log("sort", sortCondition);
  const count = await db.collection("items").countDocuments(filterCriteria);
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
