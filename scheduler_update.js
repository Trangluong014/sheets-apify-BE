require("dotenv").config();
const Website = require("./models/Website");
const mongoose = require("mongoose");
const {
  getSheetLastUpdate,
  readData,
} = require("./controllers/googleapi.controller");
const mongoURI = process.env.MONGO_DEV_URI;

// const mongoURI = process.env.MONGO_DEV_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log(`DB connected`);
  })
  .catch((err) => console.log(err));

Website.find({}, (err, data) => {
  if (err) return console.log(err);
  data.forEach(async (web) => {
    let dbUpdate = await getSheetLastUpdate(web.spreadsheetId);
    dbUpdate = dbUpdate.modifiedTime;
    dbUpdate = Date.parse(dbUpdate);
    web.dbLastUpdate = dbUpdate;
    if (web.dbLastUpdate > web.lastUpdate) {
      web.data = await readData(web.spreadsheetId, web.range);
      web.lastUpdate = Date.now();
      await web.save();
      console.log("updated DB");
    } else {
      console.log("dont need update");
    }
  });
});
