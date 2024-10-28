const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "#",
    },
    surname: {
      type: String,
      required: true,
      trim: true,
      default: "#",
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
    email_is_active: {
      type: Boolean,
      trim: true,
      default: false,
    },
    new: {
      type: Boolean,
      trim: true,
      default: true,
    },
    mobile_new: {
      type: Boolean,
      trim: true,
      default: true,
    },
    plans: {
      type: String,
      trim: true,
      required: true,
      default:"#"
    },
    apps: [
      {
        appId: {
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
