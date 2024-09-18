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

      data.visitorId = socket.id
      
      const app = await App.findOneAndUpdate(
        { appId: data.appId },
        {
          $push: { data },
        },
        { new: true }
      );
      console.log("🚀 ~ socket.on ~ app:", app)

      
    } catch (error) {}
  });
};
