const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
      trim: true,
    },
    appId: {
      type: String,
      require: true,
      trim: true,
    },
    data: [
      {
        ip: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          trim: true,
        },
        time: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
        referrer: {
          type: String,
          trim: true,
        },
        userDevice: {
          browser: {
            name: {
              type: String,
              trim: true,
            },
            version: {
              type: String,
              trim: true,
            },
            major: {
              type: String,
              trim: true,
            },
          },
          engine: {
            name: {
              type: String,
              trim: true,
            },
          },
          os: {
            name: {
              type: String,
              trim: true,
            },
            version: {
              type: String,
              trim: true,
            },
          },
          device: {},
        },
        location: {
          country: {
            type: String,
            trim: true,
          },
          city: {
            type: String,
            trim: true,
          },
        },
        screenResolution: {
          type: String,
          trim: true,
        },
        language: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

const App = mongoose.model("App", Schema);

module.exports = App;
