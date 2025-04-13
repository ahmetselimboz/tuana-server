const App = require("../db/models/App");
const auditLogs = require("../lib/auditLogs");
const logger = require("../lib/logger/logger");
const { saveTrackEvent, trackMouseMovement, trackClicks } = require("../services/appServices");

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
      //console.log("🚀 ~ trackMouseMovement ~ data:", data)
      trackMouseMovement(data);
    } catch (error) {
      console.log("🚀 ~ socket - trackMouseMovement ~ error:", error);
      auditLogs.error("" || "User", "socket", "trackMouseMovement", error);
      logger.error("" || "User", "socket", "trackMouseMovement", error);
    }
  });
  socket.on("trackClicks", async (data) => {
    try {
      //console.log("🚀 ~ trackClicks ~ data:", data)
      trackClicks(data);
    } catch (error) {
      console.log("🚀 ~ socket - trackClicks ~ error:", error);
      auditLogs.error("" || "User", "socket", "trackClicks", error);
      logger.error("" || "User", "socket", "trackClicks", error);
    }
  });
};
