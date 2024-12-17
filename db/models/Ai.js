const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    appId: { type: String, required: true },
    chat: [
      {
        chat_name: { type: String, required: true },
        messages: [
          {
            message: { type: String, required: true },
            sender: { type: String, enum: ["user", "bot"], required: true }, // Mesajın kimden geldiği
            date: {
              type: Date,
              default: Date.now,
              trim: true,
            },
          },
        ],
        date: {
          type: Date,
          default: Date.now,
          trim: true,
        },
        history: [
          // History alanı
          {
            prompt: { type: String, required: true }, // Kullanıcının girdiği istem
            response: { type: String, required: true }, // AI tarafından oluşturulan yanıt
            timestamp: { type: Date, default: Date.now }, // Zaman damgası
          },
        ],
      },
    ],
    devicesData: [],
    pagesData: [],
    locationsData: [],
    sourcesData: [],
    languagesData: [],
    limitExist: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: 0,
    },
    wordLimit: {
      type: Number,
      default: 4096,
    },
    ai_limit: {
      type: Number,
      trim: true,
      required: true,
      default: 10,
    },
    platform_data: {},
    save_history: {
      type: Boolean,
      default: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const AI = mongoose.model("AI", schema);
module.exports = AI;
