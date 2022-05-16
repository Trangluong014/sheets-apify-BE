const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const websiteSchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, require: true, ref: "Users" },
    name: { type: String, require: true },
    websiteId: { type: String, require: true },
    spreadsheetId: { type: String, require: true },
    ranges: { type: Array, require: true },
    rangeHeaders: { type: Schema.Types.Mixed },
    template: { type: String, enum: ["template1", "template2"] },
    lastUpdate: { type: String, require: true },
    dbLastUpdate: { type: String, require: true },
    config: { type: Schema.Types.Mixed },
  },
  { timestamp: true }
);

const Website = mongoose.model("Website", websiteSchema);
module.exports = Website;
