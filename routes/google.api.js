const express = require("express");
const router = express.Router();
const fs = require("fs");
const { google } = require("googleapis");
const {
  makeRedirect,
  getToken,
  readData,
  getSheetLastUpdate,
  getListSheet,
  writeToSheet,
  updateCurrentRow,
  addNewRole,
  addNewRow,
} = require("../controllers/googleapi.controller");
const {
  sendResponse,
  AppError,
  catchAsync,
  parseDynamic,
} = require("../helpers/utils");
const { loginRequired } = require("../middlewares/authentication");

// 1. Redirect Google Account O2Auth Login and
// get accesstoken to Google Drive and Google Spreadsheet

/**
 * @method: Get
 * @access: Public
 * @description: Get and save accesstoken to Google Drive and Google Spreadsheet
 */

router.get("/redirect", makeRedirect);

router.get("/O2Auth", getToken);

// 2. Get Spreadsheet Data  (just to test, not use in product)

/**
 * @method: Get
 * @access: Public
 * @description: Get spreadsheet data
 */
router.get("/spreadsheet/data", async function (req, res, next) {
  const url =
    "https://docs.google.com/spreadsheets/d/1aaXWw92AySf_PDvTWp9WT65vVCWZYuK5ipT250lHIbY/edit#gid=0";
  const range = "Sheet1";
  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];
  let data = await readData(spreadsheetId, range);
  let header = data[0];
  console.log("header", header);
  data = data.slice(1).map((e, index) => {
    const obj = {};
    for (let i = 0; i < e.length; i++) {
      obj[header[i]] = parseDynamic(e[i]);
    }
    return obj;
  });
  sendResponse(res, 200, true, { data }, null, "get data success");
});

// 3. Get Spreadsheet Last Update Information  (just to test, not use in product)

/**
 * @method: Get
 * @access: Public
 * @description: Get spreadsheet last update information
 */
router.get("/:fileId/drive/update", async function (req, res, next) {
  const { fileId } = req.params;
  console.log(fileId);
  let data = await getSheetLastUpdate(fileId);
  sendResponse(res, 200, true, { data }, null, "success");
});

// 4. Get List of Sheets in a spreadsheet:

/**
 * @method: Get
 * @access: Public
 * @description: Get list of sheets in a spreadsheet
 */
router.get("/spreadsheet/sheet", getListSheet);

// 5. Receive data from front-end and update current row in spreadsheet as well as update in Mongodb Database

/**
 * @method: Post
 * @access: Public
 * @description: Update current row in spreadsheet
 * @constructor: req.params
 */

router.patch("/:spreadsheetId/:range/:rowIndex", updateCurrentRow);

// 6. Receive data from front-end and add new row to spreadsheet as well as add to Mongodb Database

/**
 * @method: Post
 * @access: Public
 * @description: Add new row to spreadsheet
 * @constructor: req.params
 */

router.post("/:spreadsheetId/:range", addNewRow);

module.exports = router;
