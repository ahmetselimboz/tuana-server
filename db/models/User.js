const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: {
      type: String,
      trim: true,
    },
    apps: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "App",
        },
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

const User = mongoose.model("User", Schema);

module.exports = User;
