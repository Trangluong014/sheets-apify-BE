require("dotenv").config();
const mongoose = require("mongoose");
const deepEqual = require("deep-equal");

const {
  getSheetLastUpdate,
  readData,
} = require("./controllers/googleapi.controller");

const { parseDynamic } = require("./helpers/utils");
const Web = require("./models/Web");
// const { db } = require("./models/Web");
const mongoURI = process.env.MONGO_DEV_URI;
const db = mongoose.connection;

// const mongoURI = process.env.MONGO_DEV_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log(`DB connected`);
    Web.find({}, (err, webs) => {
      if (err) return console.log(err);
      webs.forEach(async (web) => {
        let dbUpdate = await getSheetLastUpdate(web.spreadsheetId);
        console.log("db", dbUpdate);
        web.dbLastUpdate = Date.parse(dbUpdate.modifiedTime);
        console.log("web", web.dbLastUpdate, web.lastUpdate);

        if (web.dbLastUpdate > web.lastUpdate) {
          // await db
          //   .collection("items")
          //   .deleteMany({ spreadsheetId: web.spreadsheetId });
          let data = await readData(web.spreadsheetId, web.range);
          let header = data[0];
          data = data.slice(1);
          const promises = data.map(async (e, index) => {
            const obj = {};
            for (let i = 0; i < e.length; i++) {
              obj.author = web.author;
              obj.spreadsheetId = web.spreadsheetId;
              obj[header[i].toLowerCase()] = parseDynamic(e[i]);
            }
            data[index] = obj;
            let item = await db.collection("items").findOneAndUpdate(
              {
                $and: [
                  { spreadsheetId: web.spreadsheetId },
                  { rowIndex: index },
                ],
              },
              {
                $set: obj,
              }
            );
          });
          await Promise.all(promises);
          const count = await db
            .collection("item")
            .countDocuments({ spreadsheetId: web.spreadsheetId });
          if (count > data.length) {
            await db
              .collection("item")
              .deleteMany({ rowIndex: { $gt: count - data.length } });
          }
          if (count < data.length) {
            data = data.slice(count - 1);
            await db.collection("items").insertMany(data);
          }

          const itemList = await db
            .collection("items")
            .find({ spreadsheetId: web.spreadsheetId })
            .toArray();
          web.data = itemList.map((item) => item._id);

          web.lastUpdate = Date.now();
          await web.save();
          console.log("updated DB");
        } else {
          console.log("dont need update");
        }
      });
    });
  })
  .catch((err) => console.log(err));
