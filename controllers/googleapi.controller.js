const { catchAsync, googleAuth, sendResponse } = require("../helpers/utils");
const fs = require("fs");
const { google } = require("googleapis");

const googleApiController = {};

googleApiController.makeRedirect = catchAsync(async function (req, res, next) {
  const oauth2Client = googleAuth();
  console.log(oauth2Client);
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.activity.readonly",
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

googleApiController.readData = async (url, range) => {
  const oauth2Client = googleAuth();
  let tokens = fs.readFileSync("tokens.json", "utf8");
  tokens = JSON.parse(tokens);
  oauth2Client.setCredentials(tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  const urlSpilt = url.split("/");
  const spreadsheetId = urlSpilt[5];
  console.log("spreadsheet", spreadsheetId);
  const request = {
    spreadsheetId,
    range,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
    majorDimension: "COLUMNS",
  };
  console.log("request", request);
  try {
    let response = (await sheets.spreadsheets.values.get(request)).data;
    response = response.values;
    const data = response.map((array, index) => {
      let data = {};
      data[array[0]] = array.slice(1);
      return data;
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = googleApiController;
