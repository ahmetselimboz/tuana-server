const App = require("../db/models/App");
const { saveTrackEvent, trackMouseMovement } = require("../services/appServices");

module.exports = (io, socket) => {
  socket.on("trackEvent", async (data) => {
    try {
      saveTrackEvent( data);
    } catch (error) {
      console.log("🚀 ~ socket - trackEvent ~ error:", error);
      auditLogs.error("" || "User", "socket", "trackEvent", error);
      logger.error("" || "User", "socket", "trackEvent", error);
    }
  });
  socket.on("trackMouseMovement", async (data) => {
    try {
      console.log("🚀 ~ socket.on ~ data:", data)
      trackMouseMovement(data);
    } catch (error) {
      console.log("🚀 ~ socket - trackEvent ~ error:", error);
      auditLogs.error("" || "User", "socket", "trackEvent", error);
      logger.error("" || "User", "socket", "trackEvent", error);
    }
  });
};
