const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const googleSchema = Schema(
  {
    tokens: { type: Schema.Types.Mixed },
  },
  { timestamp: true }
);

const Google = mongoose.model("Google", googleSchema);
module.exports = Google;
