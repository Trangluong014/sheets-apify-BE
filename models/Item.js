const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, require: true, ref: "Users" },
    spreadsheetId: { type: String, require: true }, // User
  },
  { timestamp: true }
);
const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
