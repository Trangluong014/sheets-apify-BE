const express = require("express");
const router = express.Router();
const fs = require("fs");
const { google } = require("googleapis");
const {
  makeRedirect,
  getToken,
  readData,
} = require("../controllers/googleapi.controller");
const { sendResponse, AppError, catchAsync } = require("../helpers/utils");

router.get("/redirect", makeRedirect);

router.get("/O2Auth", getToken);

router.get("/getdata", async function (req, res, next) {
  const url =
    "https://docs.google.com/spreadsheets/d/1MJAiNfjpCGmvxr5zxrkAwyRRM5q9wdNKAf17t6HNqfw/edit#gid=0";
  const range = "Sheet1";
  let data = await readData(url, range);
  sendResponse(res, 200, true, { data }, null, "success");
});

module.exports = router;
