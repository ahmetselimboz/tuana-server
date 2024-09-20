const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    appId: {
      type: String,
      required: true,
      trim: true,
    },
    type:{
      type:String,
      trim: true,
      required: true,
    },
    title:{
      type:String,
      trim: true,
      required: true,
    },
    data: [
      {
        visitorId: {
          type: String,
          trim: true,
        },
        ip: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          trim: true,
        },
        data:{},
        time: {
          type: Date,
          default: Date.now,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
        referrer: {
          type: String,
          trim: true,
          default: "Direct/None",
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
          device: {
            vendor: {
              type: String,
              trim: true,
              default: null,
            },
            model: {
              type: String,
              trim: true,
              default: null,
            },
            type: {
              type: String,
              trim: true,
              default: null,
            },
          },
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

Schema.index({ userId: 1, appId: 1 });
Schema.index({ 'data.visitorId': 1 });
Schema.index({ 'data.time': 1 });

const App = mongoose.model("App", Schema);

module.exports = App;
