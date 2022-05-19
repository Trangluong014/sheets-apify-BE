const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true, select: false },
    isDeleted: { type: Boolean, default: false, select: false },
    webId: { type: Array },
    role: { type: String, enum: ["Admin", "Customer"] },
    avatar: { type: String },
    job: { type: String },
    company: { type: String },
  },
  { timestamp: true }
);

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.isDeleted;
  return obj;
};

userSchema.methods.generateToken = function () {
  const accessToken = jwt.sign(
    { _id: this._id, role: this.role },
    JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  return accessToken;
};

const User = mongoose.model("Users", userSchema);
module.exports = User;
