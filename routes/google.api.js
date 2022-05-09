const express = require("express");
const router = express.Router();
const fs = require("fs");
const { google } = require("googleapis");
const {
  makeRedirect,
  getToken,
  readData,
  getSheetLastUpdate,
} = require("../controllers/googleapi.controller");
const { sendResponse, AppError, catchAsync } = require("../helpers/utils");

router.get("/redirect", makeRedirect);

router.get("/O2Auth", getToken);

router.get("/spreadsheet/data", async function (req, res, next) {
  const url =
    "https://docs.google.com/spreadsheets/d/1aaXWw92AySf_PDvTWp9WT65vVCWZYuK5ipT250lHIbY/edit#gid=0";
  const range = "Sheet1";
  let data = await readData(url, range);
  sendResponse(res, 200, true, { data }, null, "success");
});

router.get("/drive/update", async function (req, res, next) {
  const fileId = "1aaXWw92AySf_PDvTWp9WT65vVCWZYuK5ipT250lHIbY";
  let data = await getSheetLastUpdate(fileId);
  sendResponse(res, 200, true, { data }, null, "success");
});

module.exports = router;
