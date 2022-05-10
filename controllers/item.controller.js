const { catchAsync, sendResponse, parseDynamic } = require("../helpers/utils");
const Item = require("../models/Item");
const User = require("../models/User");
const { readData } = require("./googleapi.controller");

const itemController = {};

//Create Items
itemController.createItem = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;
  // const { url, range } = req.body;

  let admin = await User.findById(currentUserId);

  const url =
    "https://docs.google.com/spreadsheets/d/1aaXWw92AySf_PDvTWp9WT65vVCWZYuK5ipT250lHIbY/edit#gid=0";
  const range = "Sheet1";
  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];
  let data = await readData(spreadsheetId, range);

  const header = data[0];
  const promises = data.slice(1).forEach(async (e, index) => {
    try {
      const obj = {};
      for (let i = 0; i < e.length; i++) {
        obj.author = admin_.id;
        obj.spreadsheetId = spreadsheetId;
        obj[header[i]] = parseDynamic(e[i]);
      }
      return obj;
      await Item.create({
        obj,
      });
    } catch (error) {
      console.log(error);
    }
  });

  sendResponse(res, 200, true, {}, null, "create Item success");
});

itemController.getAllItem = catchAsync(async (req, res, next) => {
  let { page, limit, sort, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const { spreadsheetId } = req.params;

  const filterCondition = [{ spreadsheetId }];
  const allowFilter = ["name", "category"];
  allowFilter.forEach((field) => {
    if (filter[field] !== undefined) {
      filterCondition.push({
        [field]: { $regex: filter[field], $options: "i" },
      });
    }
  });
  const filterCriteria = filterCondition.length
    ? { $and: filterCondition }
    : {};

  let sortCondition = { createAt: -1 };
  if (sort) {
    if (sort === "priceasc") {
      sortCondition = { ...sortCondition, price: -1 };
    } else if (sort === "pricedsc") {
      sortCondition = { ...sortCondition, price: 1 };
    }
  }

  const sortCriteria = sortCondition.length ? sortCondition : {};

  console.log("filter", filterCondition);

  console.log("sort", sortCondition);
  const count = await Item.countDocuments(filter);
  const totalPage = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const ItemList = await Item.find(filterCriteria)
    .sort(sortCriteria)
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { ItemList, totalPage },
    null,
    "Get Item Successfully"
  );
});

module.exports = itemController;
