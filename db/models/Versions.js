const mongoose = require("mongoose");

const Schema =  mongoose.Schema(
  {
    android: { type: String, required: true, default:"1.0.0" },
    ios: { type: String, required: true, default:"1.0.0" },
  },
  {versionKey: false }
);

const Version = mongoose.model("Version", Schema);
module.exports = Version;
