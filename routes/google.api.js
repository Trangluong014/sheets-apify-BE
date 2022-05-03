const express = require("express");
const router = express.Router();
const fs = require("fs");
const { google } = require("googleapis");
const { sendResponse, AppError, catchAsync } = require("../helpers/utils");

let credentials = fs.readFileSync("client_secret.json", "utf8");
credentials = JSON.parse(credentials);
console.log(credentials);
const { client_id, client_secret, redirect_uris } = credentials.web;
const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris
);

router.get(
  "/redirect",
  catchAsync(async function (req, res, next) {
    let credentials = fs.readFileSync("client_secret.json", "utf8");
    credentials = JSON.parse(credentials);
    console.log(credentials);
    const { client_id, client_secret, redirect_uris } = credentials.web;
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris
    );
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
    });
    console.log(authorizationUrl);
    res.redirect(301, authorizationUrl);
    return;
  })
);

router.get(
  "/O2Auth",
  catchAsync(async function (req, res, next) {
    let credentials = fs.readFileSync("client_secret.json", "utf8");
    credentials = JSON.parse(credentials);
    console.log(credentials);
    const { client_id, client_secret, redirect_uris } = credentials.web;
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris
    );
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
  })
);

router.get("/readata", function (req, res, next) {
  function readData() {
    let credentials = fs.readFileSync("client_secret.json", "utf8");
    credentials = JSON.parse(credentials);
    console.log(credentials);
    const { client_id, client_secret, redirect_uris } = credentials.web;
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris
    );
    let tokens = fs.readFileSync("tokens.json", "utf8");
    tokens = JSON.parse(tokens);
    oauth2Client.setCredentials(tokens);
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: "1MJAiNfjpCGmvxr5zxrkAwyRRM5q9wdNKAf17t6HNqfw",
        range: "Sheet1!B1:C",
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        const rows = res.data.values;
        if (rows.length) {
          console.log("Name, Description:");
          // Print columns B and C, which correspond to indices 0 and 4.
          rows.map((row) => {
            console.log(`${row[0]}, ${row[1]}`);
          });
        } else {
          console.log("No data found.");
        }
      }
    );
  }
  const data = readData();
  sendResponse(res, 200, true, { data }, null, "success");
});
module.exports = router;
