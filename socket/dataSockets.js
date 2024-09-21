const App = require("../db/models/App");
const { saveVisitor, saveTrackEvent } = require("../services/appServices");

module.exports = (io, socket) => {
  socket.on("trackEvent", async (data) => {
    try {
      saveTrackEvent(io, socket, data);
    } catch (error) {
      console.log("🚀 ~ socket - trackEvent ~ error:", error);
      auditLogs.error("" || "User", "socket", "trackEvent", error);
      logger.error("" || "User", "socket", "trackEvent", error);
    }
  });
};
