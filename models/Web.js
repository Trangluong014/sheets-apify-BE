const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const webSchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, require: true, ref: "Users" },
    name: { type: String, require: true },
    webId: { type: String, require: true },
    spreadsheetId: { type: String, require: true },
    range: { type: String, require: true },
    template: { type: String, enum: ["template1", "template2"] },
    lastUpdate: { type: String, require: true },
    data: { type: Array },
    dbLastUpdate: { type: String, require: true },
  },
  { timestamp: true }
);

webSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.data;
  return obj;
};

const Web = mongoose.model("Web", webSchema);
module.exports = Web;
