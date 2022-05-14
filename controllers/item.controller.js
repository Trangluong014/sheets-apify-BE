const mongoose = require("mongoose");
const {
  catchAsync,
  sendResponse,
  parseDynamic,
  AppError,
} = require("../helpers/utils");

const User = require("../models/User");
const Website = require("../models/Website");
const { readData } = require("./googleapi.controller");

const itemController = {};
const DELIMITER = "__";

const db = mongoose.connection;
//Create Items

itemController.createItem = catchAsync(
  async (range, currentUserId, spreadsheetId) => {
    let admin = await User.findById(currentUserId);

    let data = await readData(spreadsheetId, range);
    let header = data[0];
    console.log("header", header);
    data = data.slice(1).map((e, index) => {
      const obj = {};
      for (let i = 0; i < e.length; i++) {
        obj.author = admin._id;
        obj.spreadsheetId = spreadsheetId;
        obj.range = range;
        obj.rowIndex = index;
        obj[header[i].toLowerCase()] = parseDynamic(e[i]);
      }
      return obj;
    });
    console.log("data", data);
    admin.spreadsheetId = spreadsheetId;
    await admin.save();

    db.collection("items").insertMany(data);

    return;
  }
);
itemController.getAllItem = catchAsync(async (req, res, next) => {
  let { page, limit, range, sort, order, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const { spreadsheetId } = req.params;

  if (!range) {
    const website = Website.findOne({ spreadsheetId });
    range = website.ranges[0];
  }
  const filterCondition = [{ spreadsheetId }, { range }];

  if (filter) {
    const withDelimiter = Object.keys(filter)
      .filter((key) => key.indexOf(DELIMITER) > -1)
      .map((key) => {
        const segment = key.split(DELIMITER);
        const value = filter[key];
        const operator = segment[segment.length - 1];
        segment.pop();
        const field = segment.join(DELIMITER);
        return [field, operator, value];
      });
    const noDelimiter = Object.keys(filter)
      .filter((key) => key.indexOf(DELIMITER) === -1)
      .map((key) => {
        const value = filter[key];
        return [key, value];
      });

    if (noDelimiter) {
      noDelimiter.forEach(([key, value]) => {
        if (value) {
          filterCondition.push({
            [key]: parseDynamic(value),
          });
        }
      });
    }
    if (withDelimiter) {
      withDelimiter.forEach(([field, operator, value]) => {
        if (value) {
          filterCondition.push(
            operator === "contains"
              ? {
                  [field]: {
                    $regex: value,
                    $options: "i",
                  },
                }
              : {
                  [field]: {
                    [`$${operator}`]: parseDynamic(value),
                  },
                }
          );
        }
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

itemController.getSingleItem = catchAsync(async (req, res, next) => {
  const { spreadsheetId, id } = req.params;

  const item = await db
    .collection("items")
    .findOne({ spreadsheetId }, { _id: id });

  if (!item) {
    throw new AppError(404, "Item not found");
  }

  return sendResponse(res, 200, true, { item }, null, "Get Single Item sucess");
});

itemController.deleteItem = catchAsync(async (req, res, next) => {
  const { spreadsheetId } = req.params;
  const { currentUserId, currentUserRole } = req;
  if (currentUserRole !== "Admin") {
    throw new AppError(403, "Only Admin can delete Item");
  }
  const admin = await User.findById(currentUserId);

  db.collection("items").deleteMany({ spreadsheetId });

  return sendResponse(res, 200, true, {}, null, "Delete Items success");
});

itemController.updateItemList = catchAsync(async (req, res, next) => {
  const {websiteId} = req.query;
  const website = await Website.findOne({websiteId})
  website.ranges.forEach( (range ) => {
    let data = await readData(website.spreadsheetId, range);
    let header = data[0];
    data = data.slice(1);
    const promises = data.map(async (e, index) => {
      const obj = {};
      for (let i = 0; i < e.length; i++) {
        obj.author = website.author;
        obj.range = range;
        obj.spreadsheetId = website.spreadsheetId;
        obj[header[i].toLowerCase()] = parseDynamic(e[i]);
      }
      data[index] = obj;
      let item = await db.collection("items").findOneAndUpdate(
        {
          $and: [
            { spreadsheetId: website.spreadsheetId }, 
            { range },
            { rowIndex: index },
          ],
        },
        {
          $set: obj,
        }
      );
    });
    await Promise.all(promises);
    const count = await db
      .collection("item")
      .countDocuments({
        $and: [
          { spreadsheetId: website.spreadsheetId },
          {range}
        ]
      });
    if (count > data.length) {
      await db
        .collection("item")
        .deleteMany({$and:[
          { rowIndex: { $gt: count - data.length } },
          { spreadsheetId: website.spreadsheetId },
          {range},
        ]});
    }
    if (count < data.length) {
      data = data.slice(count - 1);
      await db.collection("items").insertMany(data);
    }

 

    website.lastUpdate = Date.now();
    await website.save();
   return sendResponse(res,200,true,{},null,"Update DB")
})});

module.exports = itemController;
