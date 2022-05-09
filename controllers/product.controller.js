const { redirect } = require("express/lib/response");
const { catchAsync, sendResponse } = require("../helpers/utils");
const Product = require("../models/Product");
const User = require("../models/User");
const { readData } = require("./googleapi.controller");

const productController = {};

//Create Products
productController.createProduct = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;

  let admin = await User.findById(currentUserId);

  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];

  let data = await readData(spreadsheetId, range);
  console.log("data", data[0]);
  data.slice(1).forEach(async (e, index) => {
    const name = e[0];
    const price = e[1];
    const SKU = e[2];
    const image = e[3];
    const description = e[4];
    const inventory = e[5];
    const category = e[6];
    const product = await Product.create({
      author: admin._id,
      spreadsheetId,
      name,
      price,
      SKU,
      image,
      description,
      inventory,
      category,
    });
  });

  res.redirect(301, "/website/create");
});

module.exports = productController;
