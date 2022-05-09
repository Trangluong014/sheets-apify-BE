const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const websiteSchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, require: true, ref: "Users" },
    name: { type: String, require: true },
    spreadsheetId: { type: String, require: true },
    range: { type: String, require: true },
    template: { type: String, enum: ["template1", "template2"] },
    lastUpdate: { type: String, require: true }, //datetime.now, last update of website when save data from database to render
    data: { type: Array, require: true },
    dbLastUpdate: { type: String, require: true },
  },
  { timestamp: true }
);
const Website = mongoose.model("Website", websiteSchema);
module.exports = Website;
