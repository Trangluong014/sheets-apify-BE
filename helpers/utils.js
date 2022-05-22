const fs = require("fs");
const { google } = require("googleapis");
const { sheets } = require("googleapis/build/src/apis/sheets");
const client_id = process.env.CLIENT_ID;
const project_id = process.env.PROJECT_ID;
const auth_uri = process.env.AUTH_URI;
const token_uri = process.env.TOKEN_URI;
const auth_provider_x509_cert_url = process.env.AUTH_PROVIDER_X509_CERT_URL;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uris = process.env.REDIRECT_URI;

const utilsHelper = {};

// This function controls the way we response to the client
// If we need to change the way to response later on, we only need to handle it here
utilsHelper.sendResponse = (res, status, success, data, errors, message) => {
  const response = {};
  if (success) response.success = success;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (message) response.message = message;
  return res.status(status).json(response);
};

utilsHelper.generateRandomHexString = (len) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, len)
    .toUpperCase(); // return required number of characters
};

// Error handling //try-catch eliminate // catch async
utilsHelper.catchAsync = (func) => (req, res, next) =>
  func(req, res, next).catch((err) => next(err));

// utilsHelper.catchAsync=function (fnc) {
//   return (req, res, next) => {
//     return fnc(req, res, next).catch((err) => (next) => err);
//   };
// }
utilsHelper.googleAuth = () => {
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris
  );
  return oauth2Client;
};

utilsHelper.parseDynamic = (value) => {
  const FLOAT = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
  const ISO_DATE =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;
  if (value === "true" || value === "TRUE") return true;
  else if (value === "false" || value === "FALSE") return false;
  else if (FLOAT.test(value)) return parseFloat(value);
  else if (ISO_DATE.test(value)) return new Date(value);
  else return value === "" ? null : value;
};

class AppError extends Error {
  constructor(statusCode, message, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    // all errors using this class are operational errors.
    this.isOperational = true;
    // create a stack trace for debugging (Error obj, void obj to avoid stack polution)
    Error.captureStackTrace(this, this.constructor);
  }
}

utilsHelper.AppError = AppError;
module.exports = utilsHelper;
