const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    surname: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      trim: true,
    },
    password: {
      type: String,
      require: true,
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
