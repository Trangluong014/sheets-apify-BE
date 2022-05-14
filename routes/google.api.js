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
} = require("../controllers/googleapi.controller");
const {
  sendResponse,
  AppError,
  catchAsync,
  parseDynamic,
} = require("../helpers/utils");

router.get("/redirect", makeRedirect);

router.get("/O2Auth", getToken);

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

router.get("/:fileId/drive/update", async function (req, res, next) {
  const { fileId } = req.params;
  console.log(fileId);
  let data = await getSheetLastUpdate(fileId);
  sendResponse(res, 200, true, { data }, null, "success");
});

router.get("/spreadsheet/sheet", getListSheet);

module.exports = router;
