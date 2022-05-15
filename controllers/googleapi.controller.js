const { catchAsync, googleAuth, sendResponse } = require("../helpers/utils");
const fs = require("fs");
const { google } = require("googleapis");
const AlphanumericEncoder = require("alphanumeric-encoder");
const mongoose = require("mongoose");
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

  return sendResponse(res, 200, true, {}, null, "success");
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

googleApiController.writeToSheet = catchAsync(async (req, res, next) => {
  const oauth2Client = googleAuth();
  let tokens = fs.readFileSync("tokens.json", "utf8");
  tokens = JSON.parse(tokens);
  oauth2Client.setCredentials(tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  let { range, spreadsheetId, rowIndex } = req.params;
  const content = req.body;
  const encoder = new AlphanumericEncoder();

  const website = await Website.findOne({ spreadsheetId });
  const rangeHeaders = website.rangeHeaders.range;
  const headers = content.key;
  const column = headers.map((header) => {
    return { header: encoder.decode(rangeHeaders.indexOf(header + 1)) };
  });
  const data = [];

  const promises = headers.map(async (header, index) => {
    const obj = {};

    obj.range = `${range}!${column[header]}${rowIndex}`;
    obj.values = content[header];

    data[index] = obj;
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

  sendResponse(res, 200, true, {}, null, "Write to sheet done");
});
module.exports = googleApiController;
