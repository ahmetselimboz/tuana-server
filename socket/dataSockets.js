const App = require("../db/models/App");

module.exports = (io, socket, activeUsers) => {
  socket.on("trackEvent", async (data) => {
    try {
      console.log("🚀 ~ socket.on ~ data:", data);
      const result = await App.findOne({ appId: data.appId });

      if (!result) {
        await new App({
          userId: "#",
          appId: data.appId,
          type: "web",
          title: "www.tuanalytics.com",
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
     
    } catch (error) {}
  });



};
