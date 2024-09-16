const App = require("../db/models/App");

module.exports = (io, socket) => {
  socket.on("trackEvent", async (data) => {
    try {
      console.log("🚀 ~ socket.on ~ data:", data);
      const result = await App.findOne({ appId: data.appId });

      if (!result) {
        await new App({
          userId: "#",
          appId: data.appId,
          data: [],
        }).save();
      }

      const app = await App.findOneAndUpdate(
        { appId: data.appId },
        {
          $push: {
            data: { ip: data.ip, type: data.type },
          },
        },
        { new: true }
      );
    } catch (error) {}
  });
};
