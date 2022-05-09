const { redirect } = require("express/lib/response");
const { catchAsync, sendResponse } = require("../helpers/utils");
const Product = require("../models/Product");
const User = require("../models/User");
const { readData } = require("./googleapi.controller");

const productController = {};

//Create Products
productController.createProduct = catchAsync(async (req, res, next) => {
  const { currentUserId } = req;
  // const { url, range } = req.body;

  let admin = await User.findById(currentUserId);

  const url =
    "https://docs.google.com/spreadsheets/d/1aaXWw92AySf_PDvTWp9WT65vVCWZYuK5ipT250lHIbY/edit#gid=0";
  const range = "Sheet1";
  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];
  let data = await readData(spreadsheetId, range);
  const productList = [];
  data.slice(1).forEach(async (e, index) => {
    try {
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
      productList.push(product);

      return productList;
    } catch (error) {
      console.log(error);
    }
  });

  sendResponse(res, 200, true, { productList }, null, "create Product success");
});

module.exports = productController;
