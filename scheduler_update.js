require("dotenv").config();
const mongoose = require("mongoose");

const {
  getSheetLastUpdate,
  readData,
} = require("./controllers/googleapi.controller");

const { parseDynamic } = require("./helpers/utils");
const Web = require("./models/Web");
const { db } = require("./models/Web");
const mongoURI = process.env.MONGO_DEV_URI;

// const mongoURI = process.env.MONGO_DEV_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log(`DB connected`);
  })
  .catch((err) => console.log(err));

Web.find({}, (err, webs) => {
  if (err) return console.log(err);
  webs.forEach(async (web) => {
    let dbUpdate = await getSheetLastUpdate(web.spreadsheetId);
    console.log("db", dbUpdate);
    web.dbLastUpdate = Date.parse(dbUpdate.modifiedTime);
    if (web.dbLastUpdate > web.lastUpdate) {
      await db
        .collection("items")
        .deleteMany({ speadsheetId: web.spreadsheetId });
      let data = await readData(web.spreadsheetId, web.range);
      let header = data[0];
      console.log("data");
      data = data.slice(1).map((e, index) => {
        const obj = {};
        for (let i = 0; i < e.length; i++) {
          obj.author = web.author;
          obj.spreadsheetId = web.spreadsheetId;
          obj[header[i].toLowerCase()] = parseDynamic(e[i]);
        }
        return obj;
      });

      await db.collection("items").insertMany(data);

      web.data = data.map((item) => item._id);
      web.lastUpdate = Date.now();
      await web.save();
      console.log("updated DB");
    } else {
      console.log("dont need update");
    }
  });
});
