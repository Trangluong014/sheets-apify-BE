require("dotenv").config();
const mongoose = require("mongoose");
const deepEqual = require("deep-equal");

const {
  getSheetLastUpdate,
  readData,
} = require("./controllers/googleapi.controller");

const { parseDynamic } = require("./helpers/utils");
const Website = require("./models/Website");

const mongoURI = process.env.MONGO_DEV_URI;
const db = mongoose.connection;

// const mongoURI = process.env.MONGO_DEV_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log(`DB connected`);
    Website.find({}, (err, websites) => {
      if (err) return console.log(err);
      websites.forEach(async (website) => {
        let dbUpdate = await getSheetLastUpdate(website.spreadsheetId);
        console.log("db", dbUpdate);
        website.dbLastUpdate = Date.parse(dbUpdate.modifiedTime);
        console.log("web", website.dbLastUpdate, website.lastUpdate);

        if (website.dbLastUpdate > website.lastUpdate) {
          // await db
          //   .collection("items")
          //   .deleteMany({ spreadsheetId: website.spreadsheetId });
          let data = await readData(website.spreadsheetId, website.range);
          let header = data[0];
          data = data.slice(1);
          const promises = data.map(async (e, index) => {
            const obj = {};
            for (let i = 0; i < e.length; i++) {
              obj.author = website.author;
              obj.spreadsheetId = website.spreadsheetId;
              obj[header[i].toLowerCase()] = parseDynamic(e[i]);
            }
            data[index] = obj;
            let item = await db.collection("items").findOneAndUpdate(
              {
                $and: [
                  { spreadsheetId: website.spreadsheetId },
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
            .countDocuments({ spreadsheetId: website.spreadsheetId });
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
            .find({ spreadsheetId: website.spreadsheetId })
            .toArray();
          website.data = itemList.map((item) => item._id);

          website.lastUpdate = Date.now();
          await website.save();
          console.log("updated DB");
        } else {
          console.log("dont need update");
        }
      });
    });
  })
  .catch((err) => console.log(err));
