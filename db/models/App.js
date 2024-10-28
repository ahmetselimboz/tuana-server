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
    type: {
      type: String,
      trim: true,
      required: true,
    },
    project_name: {
      type: String,
      trim: true,
      required: true,
    },
    pin: {
      type: Boolean,
      trim: true,
      required: true,
      default: false,
    },
    active:{
      type: Boolean,
      trim: true,
      required: true,
      default: false,
    },
    timezone:{
      type: String,
      trim: true,
    },
    domain:{
      type:String,
      trim:true,
      default:null,
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
        data: {},
        date: {
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
    visitor: [
      {
        visitorId: {
          type: String,
          trim: true,
        },
        new: {
          type: Boolean,
          trim: true,
          default: false,
        },
        date: {
          type: Date,
          trim: true,
          default: new Date(),
        },
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

Schema.index({ userId: 1, appId: 1 });
Schema.index({ "data.visitorId": 1 });
Schema.index({ "data.time": 1 });

const App = mongoose.model("App", Schema);

module.exports = App;
