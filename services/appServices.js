const App = require("../db/models/App");
const logger = require("../lib/logger/logger");
const auditLogs = require("../lib/auditLogs");
const moment = require("moment");

const today = new Date();
today.setHours(0, 0, 0, 0);

const saveTrackEvent = async (io, socket, data) => {
  try {
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

    //console.log("🚀 ~ socket.on ~ data:", data);
    await App.findOneAndUpdate(
      { appId: data.appId },
      {
        $push: { data },
      },
      { new: true }
    );
  } catch (error) {
    console.log("🚀 ~ saveTrackEvent ~ error:", error);
    auditLogs.error("" || "User", "appServices", "saveTrackEvent", error);
    logger.error("" || "User", "appServices", "saveTrackEvent", error);
  }
};

const saveVisitor = async (data) => {
  try {
    const findIp = await App.findOne(
      { appId: data.appId, "visitor.visitorId": data.visitorId },
      { "visitor.$": 1 }
    );

    if (!findIp) {
      await App.findOneAndUpdate(
        { appId: data.appId },
        {
          $push: { visitor: { visitorId: data.visitorId, new: true } },
        },
        { new: true }
      );
    } else {
      await App.findOneAndUpdate(
        { appId: data.appId },
        {
          $push: { visitor: { visitorId: data.visitorId, new: false } },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.log("🚀 ~ saveVisitor ~ error:", error);
    auditLogs.error("" || "User", "appServices", "saveVisitor", error);
    logger.error("" || "User", "appServices", "saveVisitor", error);
  }
};

const newVisitors = async (body) => {
  try {
    const findApp = await App.findOne({ appId: body.appId }).select("visitor");

    const result = findApp.visitor.filter((item) => {
      const date = new Date(item.date);
      date.setHours(0, 0, 0, 0);

      return item.new === true && date.getTime() === today.getTime();
    });

    return result;
  } catch (error) {
    console.log("🚀 ~ newVisitors ~ error:", error);
    auditLogs.error("" || "User", "appServices", "newVisitors", error);
    logger.error("" || "User", "appServices", "newVisitors", error);
  }
};

const findTopPage = async (body) => {
  try {
    const findApp = await App.findOne({ appId: body.appId }).select("data");

    const urlCounts = findApp.data.reduce((acc, item) => {
      const visitDate = new Date(item.time);
      visitDate.setHours(0, 0, 0, 0);

      if (visitDate.getTime() === today.getTime()) {
        const url = item.url;
        if (acc[url]) {
          acc[url]++;
        } else {
          acc[url] = 1;
        }
      }

      return acc;
    }, {});

    const mostVisitedUrl = Object.keys(urlCounts).reduce((a, b) =>
      urlCounts[a] > urlCounts[b] ? a : b
    );

    return mostVisitedUrl;
  } catch (error) {
    console.log("🚀 ~ findTopPage ~ error:", error);
    auditLogs.error("" || "User", "appServices", "findTopPage", error);
    logger.error("" || "User", "appServices", "findTopPage", error);
  }
};



const calculateSessionDuration = async (body) => {
  try {
    const findApp = await App.find({ appId: body.appId }).select("data");

    const data = findApp.flatMap((app) => {
      return app.data.map((item) => {
        return {
          visitorId: item.visitorId,
          type: item.type,
          time: item.time
        };
      });
    });
    
    let sessions = {};
    
   
    data.forEach((entry) => {
      const visitorId = entry.visitorId;
      const entryTime = moment(entry.time);
    
      if (!sessions[visitorId]) {
        sessions[visitorId] = [];
      }
    
     
      if (entry.type === "page_view") {
        sessions[visitorId].push({
          viewTime: entryTime,
          exitTime: null,
        });
      }
    
    
      if (entry.type === "page_exit") {
        const lastSession = sessions[visitorId].find(
          (session) => session.exitTime === null
        );
        if (lastSession) {
          lastSession.exitTime = entryTime;
        }
      }
    });

    let totalDuration = 0;
    let sessionCount = 0;
    
    Object.keys(sessions).forEach((visitorId) => {
      sessions[visitorId].forEach((session) => {
        if (session.exitTime && session.viewTime) {
          const duration = session.exitTime.diff(session.viewTime, "seconds"); 
          totalDuration += duration;
          sessionCount++;
        }
      });
    });


    const averageDurationInSeconds = sessionCount > 0 ? totalDuration / sessionCount : 0;

 
    const minutes = Math.floor(averageDurationInSeconds / 60);
    const seconds = Math.floor(averageDurationInSeconds % 60);
  
    return { minutes, seconds };

  } catch (error) {
    console.log("🚀 ~ calculateSessionDuration ~ error:", error);
    auditLogs.error(
      "" || "User",
      "appServices",
      "calculateSessionDuration",
      error
    );
    logger.error(
      "" || "User",
      "appServices",
      "calculateSessionDuration",
      error
    );
  }
};


module.exports = {
  saveVisitor,
  saveTrackEvent,
  findTopPage,
  newVisitors,
  calculateSessionDuration,
};
