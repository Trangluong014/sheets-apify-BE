require("dotenv").config();
const mongoose = require("mongoose");
const db = mongoose.connection;
const deepEqual = require("deep-equal");

const {
  getSheetLastUpdate,
  readData,
} = require("./controllers/googleapi.controller");

const { parseDynamic } = require("./helpers/utils");
const Website = require("./models/Website");

const mongoURI = process.env.MONGO_DEV_URI;

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
          website.ranges.forEach(async (range) => {
            let data = await readData(website.spreadsheetId, range);
            if (data) {
              let headers = data[0];
              headers.map((header) => header.toLowerCase());
              data = data.slice(1);
              const promises = data.map(async (e, rowIndex) => {
                const obj = {};
                for (let i = 0; i < e.length; i++) {
                  obj[headers[i]] = parseDynamic(e[i]);
                }
                obj.author = website.author;
                obj.range = range;
                obj.rowIndex = rowIndex;
                obj.spreadsheetId = website.spreadsheetId;
                data[rowIndex] = obj;
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
              const count = await db.collection("items").countDocuments({
                $and: [{ spreadsheetId: website.spreadsheetId }, { range }],
              });
              console.log(`data of ${website.name} ${range}`, data);
              console.log(`${website.name}`, count, data.length);
              if (count > data.length) {
                await db.collection("items").deleteMany({
                  $and: [
                    { spreadsheetId: website.spreadsheetId },
                    { range },
                    { rowIndex: { $gt: data.length - 1 } },
                  ],
                });
              }
              if (count < data.length) {
                data = data.slice(count);
                await db.collection("items").insertMany(data);
              }
              website.lastUpdate = Date.now();
              await website.save();
              console.log(`update DB ${website.name}`);
            }
          });
        } else {
          console.log("dont need update");
        }
      });
    });
  })
  .catch((err) => console.log(err));
