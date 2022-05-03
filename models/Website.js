const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const websiteSchema = Schema(
  {
    name: { type: String, require: true },
    link: { type: String, require: true },
    template: { type: String, enum: ["template1", "template2"] },
    lastUpate: { type: String, require: true }, //datetime.now, last update of website when save data from database to render
    data: { type: Array, require: true },
    dbLastUpdate: { type: String, require: true },
  },
  { timestamp: true }
);
const Website = mongoose.model("Website", websiteSchema);
module.exports = Website;
