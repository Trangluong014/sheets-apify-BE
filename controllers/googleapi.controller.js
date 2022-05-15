const {
  catchAsync,
  googleAuth,
  sendResponse,
  parseDynamic,
} = require("../helpers/utils");
const fs = require("fs");
const { google } = require("googleapis");
const AlphanumericEncoder = require("alphanumeric-encoder");
const mongoose = require("mongoose");
const Website = require("../models/Website");
const db = mongoose.connection;

const googleApiController = {};

googleApiController.makeRedirect = catchAsync(async function (req, res, next) {
  const oauth2Client = googleAuth();
  console.log(oauth2Client);
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.activity.readonly",
    "https://www.googleapis.com/auth/drive",
  ];
  let authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
  });
  // authorizationUrl = `/googles/${authorizationUrl}`;
  console.log(authorizationUrl);
  res.redirect(301, authorizationUrl);
  return;
});

googleApiController.getToken = catchAsync(async function (req, res, next) {
  const oauth2Client = googleAuth();
  const { code } = req.query;
  if (!code) {
    throw new AppError(404, "Code not found", "O2Auth error");
  } else {
    console.log("code", code);

    let { tokens } = await oauth2Client.getToken(code);
    console.log("token", tokens);
    oauth2Client.setCredentials(tokens);
    fs.writeFile("tokens.json", JSON.stringify(tokens), (err) => {
      if (err) return console.error(err);
      console.log("Token stored to", "tokens.json");
    });
  }

  return sendResponse(res, 200, true, {}, null, "done");
});

googleApiController.readData = async (spreadsheetId, range) => {
  const oauth2Client = googleAuth();
  let tokens = fs.readFileSync("tokens.json", "utf8");
  tokens = JSON.parse(tokens);
  oauth2Client.setCredentials(tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  const request = {
    spreadsheetId,
    range,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
    majorDimension: "ROWS",
  };

  try {
    let response = (await sheets.spreadsheets.values.get(request)).data;
    response = response.values;
    return response;
  } catch (error) {
    console.log(error);
  }
};

googleApiController.getListSheet = catchAsync(async (req, res, next) => {
  const oauth2Client = googleAuth();
  let tokens = fs.readFileSync("tokens.json", "utf8");
  tokens = JSON.parse(tokens);
  oauth2Client.setCredentials(tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  const url = req.query.spreadsheet_url;

  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];
  console.log(spreadsheetId);
  const request = {
    spreadsheetId,
  };

  let response = (await sheets.spreadsheets.get(request)).data;
  console.log(response);
  response = response.sheets;
  const sheetsList = response.map((sheet) => sheet.properties.title);
  return sendResponse(res, 200, true, sheetsList, null, "List of sheets");
});

googleApiController.getSheetLastUpdate = async (fileId) => {
  const oauth2Client = googleAuth();
  let tokens = fs.readFileSync("tokens.json", "utf8");
  tokens = JSON.parse(tokens);
  oauth2Client.setCredentials(tokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const params = {
    fileId,
    fields: "trashed,modifiedTime",
  };

  try {
    let response = (await drive.files.get(params)).data;

    return response;
  } catch (error) {
    console.log(error);
  }
};

googleApiController.updateCurrentRow = catchAsync(async (req, res, next) => {
  const oauth2Client = googleAuth();
  let tokens = fs.readFileSync("tokens.json", "utf8");
  tokens = JSON.parse(tokens);
  oauth2Client.setCredentials(tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  let { range, spreadsheetId, rowIndex } = req.params;
  console.log(range, spreadsheetId, rowIndex);
  let content = req.body;

  content = Object.fromEntries(
    Object.entries(content).map(([k, v]) => [k.toLowerCase(), parseDynamic(v)])
  );
  console.log("content", content);
  const encoder = new AlphanumericEncoder();

  const website = await Website.findOne({ spreadsheetId });
  const rangeHeaders = website.rangeHeaders[range];
  console.log("headerdb", rangeHeaders);
  const headers = Object.keys(content);
  console.log("header", headers);

  const data = headers.map((header) => {
    return {
      range: `${range}!${encoder.encode(rangeHeaders.indexOf(header) + 1)}${
        parseDynamic(rowIndex) + 2
      }`,
      values: [[String(content[header])]],
    };
  });
  console.log("data", data);

  const item = await db.collection("items").findOneAndUpdate(
    {
      $and: [
        { spreadsheetId },
        { range },
        { rowIndex: parseDynamic(rowIndex) },
      ],
    },
    {
      $set: content,
    }
  );

  console.log("item", item);

  // const data = [
  //   {
  //     range: "Sheet1!A1", // Update single cell
  //     values: [["A1"]],
  //   },
  //   {
  //     range: "Sheet1!B1:B3", // Update a column
  //     values: [["B1"], ["B2"], ["B3"]],
  //   },
  // ];

  const resource = {
    data: data,
    valueInputOption: "USER_ENTERED",
  };
  sheets.spreadsheets.values.batchUpdate({ spreadsheetId, resource });

  sendResponse(res, 200, true, {}, null, "Update current row done");
});

googleApiController.addNewRow = catchAsync(async (req, res, next) => {
  const oauth2Client = googleAuth();
  let tokens = fs.readFileSync("tokens.json", "utf8");
  tokens = JSON.parse(tokens);
  oauth2Client.setCredentials(tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  let { range, spreadsheetId } = req.params;
  console.log(range, spreadsheetId);
  let content = req.body;

  content = Object.fromEntries(
    Object.entries(content).map(([k, v]) => [k.toLowerCase(), parseDynamic(v)])
  );
  console.log("content", content);
  const encoder = new AlphanumericEncoder();

  const rowIndex = await db
    .collection("items")
    .countDocuments({ $and: [{ spreadsheetId }, { range }] });
  console.log("row", rowIndex);
  const website = await Website.findOne({ spreadsheetId });
  const rangeHeaders = website.rangeHeaders[range];
  console.log("headerdb", rangeHeaders);
  const headers = Object.keys(content);
  console.log("header", headers);

  const data = headers.map((header) => {
    return {
      range: `${range}!${encoder.encode(rangeHeaders.indexOf(header) + 1)}${
        parseDynamic(rowIndex) + 2
      }`,
      values: [[String(content[header])]],
    };
  });
  console.log("data", data);

  const item = await db.collection("items").insertOne({
    author: website.author,
    spreadsheetId,
    range,
    rowIndex,
    ...content,
  });

  console.log("item", item);

  // const data = [
  //   {
  //     range: "Sheet1!A1", // Update single cell
  //     values: [["A1"]],
  //   },
  //   {
  //     range: "Sheet1!B1:B3", // Update a column
  //     values: [["B1"], ["B2"], ["B3"]],
  //   },
  // ];

  const resource = {
    data: data,
    valueInputOption: "USER_ENTERED",
  };
  sheets.spreadsheets.values.batchUpdate({ spreadsheetId, resource });

  sendResponse(res, 200, true, {}, null, "Add new column done");
});
module.exports = googleApiController;
