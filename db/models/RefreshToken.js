const mongoose = require("mongoose");

const Schema =  mongoose.Schema(
  {
    token: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const RefreshToken = mongoose.model("RefreshToken", Schema);
module.exports = RefreshToken;
