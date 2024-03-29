const mongoose = require("mongoose");
const {
  catchAsync,
  sendResponse,
  parseDynamic,
  AppError,
} = require("../helpers/utils");
const ObjectId = require("mongodb").ObjectId;

const User = require("../models/User");
const Website = require("../models/Website");
const { readData, getSheetLastUpdate } = require("./googleapi.controller");

const itemController = {};
const DELIMITER = "__";

const db = mongoose.connection;
//Create Items

itemController.createItem = catchAsync(
  async (range, currentUserId, spreadsheetId) => {
    let admin = await User.findById(currentUserId);

    let data = await readData(spreadsheetId, range);
    console.log("length", data.length);
    let headers = data[0].map((header) => header.toLowerCase());
    console.log("header", headers);
    if (data.length > 1) {
      data = data.slice(1).map((e, index) => {
        const obj = {};
        for (let i = 0; i < e.length; i++) {
          obj.author = admin._id;
          obj.spreadsheetId = spreadsheetId;
          obj.range = range;
          obj.rowIndex = index;
          obj[headers[i]] = parseDynamic(e[i]);
        }
        return obj;
      });
      admin.spreadsheetId = spreadsheetId;
      await admin.save();

      db.collection("items").insertMany(data);
    }

    return headers;
  }
);
itemController.getAllItem = catchAsync(async (req, res, next) => {
  let { page, limit, range, sort, order, ...filter } = { ...req.query };
  console.log(sort, order);
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const { spreadsheetId } = req.params;

  if (!range) {
    const website = await Website.findOne({ spreadsheetId });
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
    } else if (order === "desc") {
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
    "Get Item done"
  );
});

itemController.getSingleItem = catchAsync(async (req, res, next) => {
  const { spreadsheetId, rowIndex, range } = req.params;

  const item = await db.collection("items").findOne({
    $and: [{ spreadsheetId }, { range }, { rowIndex: parseDynamic(rowIndex) }],
  });

  if (!item) {
    throw new AppError(404, "Item not found");
  }

  return sendResponse(res, 200, true, { item }, null, "Get Single Item done");
});

itemController.deleteItem = catchAsync(async (req, res, next) => {
  const { spreadsheetId } = req.params;
  const { currentUserId, currentUserRole } = req;
  if (currentUserRole !== "Admin") {
    throw new AppError(403, "Only Admin can delete Item");
  }
  const admin = await User.findById(currentUserId);

  db.collection("items").deleteMany({ spreadsheetId });

  return sendResponse(res, 200, true, {}, null, "Delete Items done");
});

itemController.updateItemList = catchAsync(async (req, res, next) => {
  const { websiteId } = req.params;
  console.log(websiteId);
  const website = await Website.findOne({ websiteId });
  if (!website) {
    throw new AppError(
      404,
      "Website not found",
      "Update Website From Sheets Error"
    );
  }

  const promise1 = website.ranges.map(async (range) => {
    let data = await readData(website.spreadsheetId, range);
    if (data) {
      let headers = data[0].map((header) => header.toLowerCase());
      data = data.slice(1);
      const promises = data.map(async (e, rowIndex) => {
        const obj = {};
        for (let i = 0; i < e.length; i++) {
          obj[headers[i]] = parseDynamic(e[i]);
        }
        obj.author = website.author;
        obj.range = range;
        obj.rowIndex = rowIndex;
        obj.spreadsheetId = website.spreadsheetId;
        data[rowIndex] = obj;
        let item = await db.collection("items").findOneAndUpdate(
          {
            $and: [
              { spreadsheetId: website.spreadsheetId },
              { range },
              { rowIndex },
            ],
          },
          {
            $set: obj,
          }
        );
      });
      await Promise.all(promises);
      const count = await db.collection("items").countDocuments({
        $and: [{ spreadsheetId: website.spreadsheetId }, { range }],
      });
      console.log(`data of ${website.name} ${range}`, data);
      console.log(`${website.name}`, count, data.length);
      if (count > data.length) {
        await db.collection("items").deleteMany({
          $and: [
            { spreadsheetId: website.spreadsheetId },
            { range },
            { rowIndex: { $gt: data.length - 1 } },
          ],
        });
      }
      if (count < data.length) {
        data = data.slice(count);
        await db.collection("items").insertMany(data);
      }
    }
  });
  await Promise.all(promise1);
  let dbUpdate = await getSheetLastUpdate(website.spreadsheetId);
  console.log("db", dbUpdate);
  website.dbLastUpdate = Date.parse(dbUpdate.modifiedTime);
  website.lastUpdate = Date.now();
  await website.save();

  return sendResponse(res, 200, true, {}, null, `update DB ${website.name}`);
});

module.exports = itemController;
