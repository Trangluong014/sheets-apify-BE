const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, require: true, ref: "Users" },
    spreadsheetId: { type: String, require: true }, // User
    name: { type: String, require: true },
    price: { type: String, require: true },
    SKU: { type: String, require: true },
    image: { type: String, require: true },
    description: { type: String, require: true },
    inventory: { type: String, require: true },
    category: { type: String, require: true },
  },
  { timestamp: true }
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
