require("dotenv").config();
const Website = require("./models/Website");
const mongoose = require("mongoose");
const {
  getSheetLastUpdate,
  readData,
} = require("./controllers/googleapi.controller");
const Product = require("./models/Product");
const mongoURI = process.env.MONGO_DEV_URI;

// const mongoURI = process.env.MONGO_DEV_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log(`DB connected`);
  })
  .catch((err) => console.log(err));

Website.find({}, (err, webs) => {
  if (err) return console.log(err);
  webs.forEach(async (web) => {
    let dbUpdate = await getSheetLastUpdate(web.spreadsheetId);
    web.dbLastUpdate = Date.parse(dbUpdate.modifiedTime);
    if (web.dbLastUpdate > web.lastUpdate) {
      await Product.deleteMany({ spreadsheetId: web.spreadsheetId });
      let data = await readData(web.spreadsheetId, web.range);
      console.log("data", data);
      const promises = data.slice(1).map(async (e, index) => {
        await Product.create({
          author: web.author,
          spreadsheetId: web.spreadsheetId,
          name: e[0],
          price: e[1],
          SKU: e[2],
          image: e[3],
          description: e[4],
          inventory: e[5],
          category: e[6],
        });
      });
      await Promise.all(promises);

      Product.find({ spreadsheetId: web.spreadsheetId }, async (err, data) => {
        if (err) {
          return console.log(err);
        }
        console.log("data", data);
        idList = data.map((product) => product._id);
        console.log("id", idList);
        web.data = idList;
        web.lastUpdate = Date.now();
        await web.save();
        console.log("updated DB");
      });
    } else {
      console.log("dont need update");
    }
  });
});
