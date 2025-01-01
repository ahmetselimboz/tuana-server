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
    active: {
      type: Boolean,
      trim: true,
      required: true,
      default: false,
    },
    timezone: {
      type: String,
      trim: true,
    },
    favicon: {
      type: String,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
      default: null,
    },

    visitor: [
      {
        visitorId: {
          type: String,
          trim: true,
          required: true,
        },
        session: {
          type: String,
          trim: true,
          required: true,
        },
        data: [
          {
            type: {
              type: String,
              trim: true,
              required: true,
            },
            details: {},

            url: {
              type: String,
              trim: true,
              required: true,
            },
            referrer: {
              type: String,
              trim: true,
              default: "Direct/None",
              required: true,
            },
            userDevice: {
              browser: {
                name: {
                  type: String,
                  trim: true,
                  required: true,
                },
                version: {
                  type: String,
                  trim: true,
                  required: true,
                },
                major: {
                  type: String,
                  trim: true,
                  required: true,
                },
              },
              engine: {
                name: {
                  type: String,
                  trim: true,
                  required: true,
                },
              },
              os: {
                name: {
                  type: String,
                  trim: true,
                  required: true,
                },
                version: {
                  type: String,
                  trim: true,
                  required: true,
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
                required: true,
              },
              city: {
                type: String,
                trim: true,
                required: true,
              },
            },
            screenResolution: {
              type: String,
              trim: true,
              required: true,
            },

            date: {
              type: Date,
              default: Date.now,
              trim: true,
            },
          },
        ],
        new: {
          type: Boolean,
          trim: true,
          default: false,
        },
        date: {
          type: Date,
          default: Date.now,
          trim: true,
        },
        language: {
          type: String,
          trim: true,
          required: true,
        },
      },
    ],

    movements: [
      {
        details: {
          type: Object,
        },
        url: {
          type: String,
          trim: true,
          required: true,
        },
        coord: [
          {
            time: {
              type: Date,
              default: Date.now,
              trim: true,
            },
            values: [
              {
                x: Number,
                y: Number,
                screenWidth: Number,
                screenHeight: Number,
                time: {
                  type: Date,
                },
              },
            ],
          },
        ],
      },
    ],
    clicks: [
      {
        details: {
          type: Object,
        },
        url: {
          type: String,
          trim: true,
          required: true,
        },
        coord: [
          {
            time: {
              type: Date,
              default: Date.now,
              trim: true,
            },
            values: [
              {
                x: Number,
                y: Number,
                screenWidth: Number,
                screenHeight: Number,
                time: {
                  type: Date,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

Schema.index({ userId: 1, appId: 1 });
Schema.index({ "visitor.visitorId": 1 });
Schema.index({ "visitor.date": 1 });
Schema.index({ "movements.coord.time": 1 });


const App = mongoose.model("App", Schema);

module.exports = App;
