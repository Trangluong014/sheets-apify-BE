// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const jwt = require("jsonwebtoken");
// const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// const adminSchema = Schema(
//   {
//     name: { type: String, require: true },
//     email: { type: String, require: true, unique: true },
//     password: { type: String, require: true, select: false },
//     isDeleted: { type: Boolean, default: false, select: false },
//     webId: { type: String },
//   },
//   { timestamp: true }
// );

// adminSchema.methods.toJSON = function () {
//   const obj = this._doc;
//   delete obj.password;
//   delete obj.isDeleted;
//   return obj;
// };

// adminSchema.methods.generateToken = function () {
//   const accessToken = jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
//     expiresIn: "1d",
//   });
//   return accessToken;
// };

// const Admin = mongoose.model("Admins", adminSchema);
// module.exports = Admin;
