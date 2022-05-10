const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = Schema({}, { timestamp: true }, { strict: false });
const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
