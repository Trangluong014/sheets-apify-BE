const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, require: true, ref: "Users" },
    spreadsheetId: { type: String, require: true }, // User
    name: { type: String, require: true },
    price: { type: Schema.Types.Decimal128, require: true },
    saleprice: { type: Schema.Types.Decimal128 },
    SKU: { type: String, require: true },
    image: { type: String },
    description: { type: String, require: true },
    size: { type: String },
    inventory: { type: Schema.Types.Number, require: true },
    category: { type: String, require: true },
  },
  { timestamp: true }
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
