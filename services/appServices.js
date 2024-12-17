const App = require("../db/models/App");
const logger = require("../lib/logger/logger");
const auditLogs = require("../lib/auditLogs");
const moment = require("moment");
const CustomError = require("../lib/error");
const _enum = require("../config/enum");

const data = [
  { referrer: "http://localhost:3000/analytics?id=TNAKLYTP" },
  { referrer: "https://www.google.com" },
  { referrer: "https://www.github.com" },
  { referrer: "https://www.linkedin.com" },
  { referrer: "https://twitter.com" },
  { referrer: "https://yandex.com" },
  { referrer: "https://www.bing.com" },
  { referrer: "https://yahoo.com" },
  { referrer: "https://yahoo.com" },
  { referrer: "https://twitter.com" },
];

// Domaini referrer URL'sinden dinamik olarak çıkartan fonksiyon
function getDomainFromReferrer(referrer) {
  try {
    const url = new URL(referrer);
    return url.hostname.replace("www.", ""); // 'www.' kısmını kaldır
  } catch (error) {
    return "Direct/None"; // Referrer yoksa 'Direct/None' olarak kabul et
  }
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const filterVisitorsByDate = (visitors, firstdate, lastdate) => {
  try {
    return visitors.filter((item) => {
      const date = new Date(item.date);
      date.setHours(0, 0, 0, 0);

      if (!firstdate || firstdate === "null") {
        // Sadece 'lastdate' verilmişse o tarihe eşit olanları döner
        const getlastdate = new Date(lastdate);
        getlastdate.setHours(0, 0, 0, 0);

        return date.getTime() === getlastdate.getTime();
      } else {
        // Hem 'firstdate' hem 'lastdate' verilmişse aralığı kontrol eder
        const getlastdate = new Date(lastdate);
        getlastdate.setHours(0, 0, 0, 0);

        const getfirstdate = new Date(firstdate);
        getfirstdate.setHours(0, 0, 0, 0);

        return (
          date.getTime() >= getfirstdate.getTime() && // İlk tarih dahil
          date.getTime() <= getlastdate.getTime() // Son tarih dahil
        );
      }
    });
  } catch (error) {
    console.log("🚀 ~ filterVisitorsByDate ~ error:", error);
    auditLogs.error("" || "User", "appServices", "filterVisitorsByDate", error);
    logger.error("" || "User", "appServices", "filterVisitorsByDate", error);
  }
};

const saveTrackEvent = async (io, socket, data) => {
  try {
    const result = await App.findOne({ appId: data.appId });
    console.log("🚀 ~ saveTrackEvent ~ data:", data);

    if (!result) {
      // throw new CustomError(
      //   _enum.HTTP_CODES.INT_SERVER_ERROR,
      //   "/saveTrackEvent Error",
      //   "Couldn't find app "
      // );
      // return res.status(_enum.HTTP_CODES.OK).json(
      //   Response.serverResponse({
      //     code: _enum.HTTP_CODES.INT_SERVER_ERROR,
      //     message: "Wrong password!",
      //   })
      // );
      console.log("🚀 ~ saveTrackEvent ~ Couldn't find app!");
    }

    // Kullanıcıyı bul
    const visitorExist = await App.findOne({
      appId: data.appId,
      visitor: { $elemMatch: { visitorId: data.visitorId } },
    });
    //console.log("🚀 ~ saveTrackEvent ~ userExist:", visitorExist);

    if (!visitorExist) {
      await App.findOneAndUpdate(
        { appId: data.appId }, // Belgeyi bulmak için ID
        {
          $push: {
            visitor: {
              visitorId: data.visitorId,
              session: data.session,
              data: [
                {
                  type: data.type,
                  details: data.data || {},
                  url: data.url,
                  referrer: data.referrer || "Direct/None",
                  userDevice: {
                    browser: data.userDevice.browser,
                    engine: data.userDevice.engine,
                    os: data.userDevice.os,
                    device: data.userDevice.device,
                  },
                  location: {
                    country: data.location.country,
                    city: data.location.city || "",
                  },
                  screenResolution: data.screenResolution,
                  language: data.language,
                },
              ],
              new: true,
            },
          },
        }, // visitor array'ine veri ekleme
        { new: true } // Güncellenmiş belgeyi döner
      );
    } else {
      const sessionExist = await App.findOne({
        appId: data.appId,
        visitor: { $elemMatch: { session: data.session } },
      });

      if (sessionExist) {
        await App.findOneAndUpdate(
          { appId: data.appId, "visitor.session": data.session },
          {
            $push: {
              "visitor.$[elem].data": {
                type: data.type,
                details: data.data || {},
                url: data.url,
                referrer: data.referrer || "Direct/None",
                userDevice: {
                  browser: data.userDevice.browser,
                  engine: data.userDevice.engine,
                  os: data.userDevice.os,
                  device: data.userDevice.device,
                },
                location: {
                  country: data.location.country,
                  city: data.location.city || "",
                },
                screenResolution: data.screenResolution,
                language: data.language,
              },
            },
          },
          {
            arrayFilters: [{ "elem.session": data.session }], // Doğru `visitor` öğesini seç
            new: true, // Güncellenmiş belgeyi döner
          }
        );
      } else {
        await App.findOneAndUpdate(
          { appId: data.appId }, // Belgeyi bulmak için ID
          {
            $push: {
              visitor: {
                visitorId: data.visitorId,
                session: data.session,
                data: [
                  {
                    type: data.type,
                    details: data.data || {},
                    url: data.url,
                    referrer: data.referrer || "Direct/None",
                    userDevice: {
                      browser: data.userDevice.browser,
                      engine: data.userDevice.engine,
                      os: data.userDevice.os,
                      device: data.userDevice.device,
                    },
                    location: {
                      country: data.location.country,
                      city: data.location.city || "",
                    },
                    screenResolution: data.screenResolution,
                    language: data.language,
                  },
                ],
                new: false,
              },
            },
          }, // visitor array'ine veri ekleme
          { new: true } // Güncellenmiş belgeyi döner
        );
      }
    }

    // Gelen session'a uygun olan `visitor` öğesinin data alanını güncelle
  } catch (error) {
    console.log("🚀 ~ saveTrackEvent ~ error:", error);
    auditLogs.error("" || "User", "appServices", "saveTrackEvent", error);
    logger.error("" || "User", "appServices", "saveTrackEvent", error);
  }
};

const saveVisitor = async (data) => {
  try {
    // const findIp = await App.findOne(
    //   { appId: data.appId, "visitor.visitorId": data.visitorId },
    //   { "visitor.$": 1 }
    // );
    // if (!findIp) {
    //   await App.findOneAndUpdate(
    //     { appId: data.appId },
    //     {
    //       $push: {
    //         visitor: { visitorId: data.visitorId, new: true, date: new Date() },
    //       },
    //     },
    //     { new: true }
    //   );
    // } else {
    //   await App.findOneAndUpdate(
    //     { appId: data.appId },
    //     {
    //       $push: {
    //         visitor: {
    //           visitorId: data.visitorId,
    //           new: false,
    //           date: new Date(),
    //         },
    //       },
    //     },
    //     { new: true }
    //   );
    // }
  } catch (error) {
    console.log("🚀 ~ saveVisitor ~ error:", error);
    auditLogs.error("" || "User", "appServices", "saveVisitor", error);
    logger.error("" || "User", "appServices", "saveVisitor", error);
  }
};

const newVisitors = async (body) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün saat kısmını sıfırla

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Ertesi gün

    const result = await App.aggregate([
      { $match: { appId: body.appId } }, // appId'ye göre belgeyi bul
      {
        $project: {
          visitor: {
            $filter: {
              // MongoDB filter pipeline kullanımı
              input: "$visitor",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.new", true] }, // 'new' alanı true olanlar
                  { $gte: ["$$item.date", today] }, // Tarih >= bugünün başlangıcı
                  { $lt: ["$$item.date", tomorrow] }, // Tarih < yarının başlangıcı
                ],
              },
            },
          },
        },
      },
    ]);

    return result;
  } catch (error) {
    console.log("🚀 ~ newVisitors ~ error:", error);
    auditLogs.error("" || "User", "appServices", "newVisitors", error);
    logger.error("" || "User", "appServices", "newVisitors", error);
  }
};

const findTopPage = async (body) => {
  try {
    const findApp = await App.findOne({ appId: body.appId }).select("visitor");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const urlCounts = findApp.visitor.reduce((acc, visitor) => {
      // Her ziyaretçinin data dizisini kontrol et
      visitor.data.forEach((item) => {
        const visitDate = new Date(item.date);
        visitDate.setHours(0, 0, 0, 0);

        if (visitDate.getTime() === today.getTime()) {
          const url = item.url;
          if (acc[url]) {
            acc[url]++;
          } else {
            acc[url] = 1;
          }
        }
      });

      return acc;
    }, {});

    // En çok ziyaret edilen URL'yi bul
    const mostVisitedUrl = Object.keys(urlCounts).length
      ? Object.keys(urlCounts).reduce((a, b) =>
          urlCounts[a] > urlCounts[b] ? a : b
        )
      : null;

    return mostVisitedUrl;
  } catch (error) {
    console.log("🚀 ~ findTopPage ~ error:", error);
    auditLogs.error("" || "User", "appServices", "findTopPage", error);
    logger.error("" || "User", "appServices", "findTopPage", error);
  }
};

const calculateSessionDuration = async (body) => {
  try {
    const findApp = await App.find({ appId: body.appId }).select("visitor");

    // Veriyi düzleştir ve tarihleri kontrol et
    const data = findApp.flatMap((app) =>
      app.visitor.flatMap((visitor) =>
        visitor.data.map((item) => ({
          visitorId: visitor.visitorId,
          type: item.type,
          date: moment(item.date).isValid() ? moment(item.date) : null,
        }))
      )
    );
    
    // Tarih aralığına göre filtreleme
    const filteredData = filterVisitorsByDate(data, body.firstdate, body.lastdate);
    
    let sessions = {};
    let totalDuration = 0;
    let sessionCount = 0;
    
    // Oturumları oluştur ve süreleri hesapla
    filteredData.forEach((entry) => {
      const { visitorId, type, date } = entry;
    
      if (!date) {
        console.error("Geçersiz tarih:", entry);
        return;
      }
    
      if (!sessions[visitorId]) sessions[visitorId] = [];
    
      if (type === "page_view") {
        sessions[visitorId].push({ viewTime: date, exitTime: null });
      } else if (type === "User leaving the page") {
        const lastSession = sessions[visitorId].find((s) => !s.exitTime);
        if (lastSession) lastSession.exitTime = date;
      }
    });
    
    // Ortalama süre hesaplama
    Object.values(sessions).forEach((visitorSessions) => {
      visitorSessions.forEach(({ viewTime, exitTime }) => {
        if (viewTime && exitTime && viewTime.isValid() && exitTime.isValid()) {
          const duration = exitTime.diff(viewTime, "seconds");
          totalDuration += duration;
          sessionCount++;
        }
      });
    });
    
    const averageDurationInSeconds =
      sessionCount > 0 ? totalDuration / sessionCount : 0;
    
    const minutes = Math.floor(averageDurationInSeconds / 60);
    const seconds = Math.floor(averageDurationInSeconds % 60);
    
    console.log(`Ortalama Oturum Süresi: ${minutes} dakika ${seconds} saniye`);
    
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

const lineCard = async (body, query) => {
  try {
    const { firstdate, lastdate } = query;

    const totalVisitor = await App.findOne({ appId: body.appId }).select(
      "visitor.date visitor._id visitor.new"
    );

    const totalVisitorResult = filterVisitorsByDate(
      totalVisitor.visitor,
      firstdate,
      lastdate
    );

    //  console.log("🚀 ~ lineCard ~ totalVisitorResult:", totalVisitorResult)

    const timezone = await App.findOne({ appId: body.appId }).select(
      "timezone"
    );

    const totalPageResult = await App.find({ appId: body.appId }).select(
      "data.type data.date date._id"
    );

    const totalPage = totalPageResult[0]?.data.filter(
      (item) => item.type === "page_view"
    );

    const totalPageRange = filterVisitorsByDate(totalPage, firstdate, lastdate);

    const newVisitors = totalVisitor?.visitor.filter(
      (item) => item.new === true
    );

    const newVisitorsResult = filterVisitorsByDate(
      newVisitors,
      firstdate,
      lastdate
    );

    const result = {
      timezone: timezone.timezone,
      totalVisitor: totalVisitorResult,
      totalPage: totalPageRange,
      newVisitors: newVisitorsResult,
    };

    return { result };
  } catch (error) {
    console.log("🚀 ~ lineCard ~ error:", error);
    auditLogs.error("" || "User", "appServices", "lineCard", error);
    logger.error("" || "User", "appServices", "lineCard", error);
  }
};

const deviceCard = async (body, query) => {
  try {
    let { firstdate, lastdate } = query;
    // console.log("old lastdate: ",lastdate);
    // firstdate = new Date(firstdate).toString()
    // lastdate = new Date(lastdate)
    // console.log("new lastdate: ",lastdate);

    const totalPageResult = await App.find({ appId: body.appId }).select(
      "data.userDevice data.date data.type"
    );
    // console.log("🚀 ~ deviceCard ~ totalPageResult:", totalPageResult)

    const totalPage = totalPageResult[0]?.data.filter(
      (item) => item.type === "page_view"
    );

    const totalPageRange = await filterVisitorsByDate(
      totalPage,
      firstdate,
      lastdate
    );

    // const result = {
    //   totalPage: totalPageRange,
    // };

    return totalPageRange;
  } catch (error) {
    console.log("🚀 ~ deviceCard ~ error:", error);
    auditLogs.error("" || "User", "appServices", "deviceCard", error);
    logger.error("" || "User", "appServices", "deviceCard", error);
  }
};

const pageCard = async (body, query) => {
  try {
    const { firstdate, lastdate } = query;

    const totalPageResult = await App.find({ appId: body.appId }).select(
      "data"
    );

    const totalPage = totalPageResult[0]?.data.filter(
      (item) => item.type === "page_view"
    );

    const totalPageRange = await filterVisitorsByDate(
      totalPage,
      firstdate,
      lastdate
    );

    const pageViews = totalPageRange.reduce((acc, page) => {
      const route = page.url;

      if (!acc[route]) {
        acc[route] = 0;
      }

      acc[route] += 1;

      return acc;
    }, {});

    const formattedPageViews = Object.keys(pageViews).map((route) => ({
      route: route,
      visitor: pageViews[route].toString(),
    }));

    const result = {
      totalPage: formattedPageViews,
    };

    return result;
  } catch (error) {
    console.log("🚀 ~ pageCard ~ error:", error);
    auditLogs.error("" || "User", "appServices", "pageCard", error);
    logger.error("" || "User", "appServices", "pageCard", error);
  }
};

const locationCard = async (body, query) => {
  try {
    const { firstdate, lastdate } = query;

    const totalPageResult = await App.find({ appId: body.appId }).select(
      "data"
    );

    const totalPage = totalPageResult[0]?.data.filter(
      (item) => item.type === "page_view"
    );

    const totalPageRange = await filterVisitorsByDate(
      totalPage,
      firstdate,
      lastdate
    );

    const uniqueVisitors = new Set();
    const countriesData = {};

    totalPageRange.forEach((entry) => {
      const country = entry.location.country;
      const visitorId = entry.visitorId;
      if (country && visitorId && !uniqueVisitors.has(visitorId)) {
        uniqueVisitors.add(visitorId);

        if (countriesData[country]) {
          countriesData[country]++;
        } else {
          countriesData[country] = 1;
        }
      }
    });

    const locationData = Object.entries(countriesData).map(
      ([country, visitor]) => ({ country, visitor })
    );

    const result = {
      totalLocationVisitor: locationData,
    };

    return result;
  } catch (error) {
    console.log("🚀 ~ locationCard ~ error:", error);
    auditLogs.error("" || "User", "appServices", "locationCard", error);
    logger.error("" || "User", "appServices", "locationCard", error);
  }
};

const sourcesCard = async (body, query) => {
  try {
    const { firstdate, lastdate } = query;

    const totalPageResult = await App.find({ appId: body.appId }).select(
      "data"
    );

    const totalPage = totalPageResult[0]?.data.filter(
      (item) => item.type === "page_view"
    );

    const totalPageRange = await filterVisitorsByDate(
      totalPage,
      firstdate,
      lastdate
    );

    const referrerCounts = {};

    totalPageRange.forEach((item) => {
      const domain = getDomainFromReferrer(item.referrer);

      if (referrerCounts[domain]) {
        referrerCounts[domain]++;
      } else {
        referrerCounts[domain] = 1;
      }
    });

    const sources = Object.keys(referrerCounts).map((domain) => ({
      route: domain,
      visitor: referrerCounts[domain],
    }));

    const result = {
      totalSources: sources,
    };

    return result;
  } catch (error) {
    console.log("🚀 ~ sourcesCard ~ error:", error);
    auditLogs.error("" || "User", "appServices", "sourcesCard", error);
    logger.error("" || "User", "appServices", "sourcesCard", error);
  }
};

const languagesCard = async (body, query) => {
  try {
    const { firstdate, lastdate } = query;

    const totalPageResult = await App.find({ appId: body.appId }).select(
      "data.language data.visitorId data.date data.type"
    );

    const totalPage = totalPageResult[0]?.data.filter(
      (item) => item.type === "page_view"
    );

    const totalPageRange = await filterVisitorsByDate(
      totalPage,
      firstdate,
      lastdate
    );

    const result = {
      uniqueVisitor: [],
      languages: [],
    };

    const uniqueVisitors = new Set();
    const languageCount = {};

    totalPageRange.forEach((entry) => {
      const visitorId = entry.visitorId;
      const lang = entry.language;

      if (!uniqueVisitors.has(visitorId)) {
        uniqueVisitors.add(visitorId);

        if (languageCount[lang]) {
          languageCount[lang]++;
        } else {
          languageCount[lang] = 1;
        }
      }
    });

    result.languages = Object.keys(languageCount);
    result.uniqueVisitor = Object.values(languageCount);

    return result;
  } catch (error) {
    console.log("🚀 ~ languagesCard ~ error:", error);
    auditLogs.error("" || "User", "appServices", "languagesCard", error);
    logger.error("" || "User", "appServices", "languagesCard", error);
  }
};

module.exports = {
  saveVisitor,
  saveTrackEvent,
  findTopPage,
  newVisitors,
  calculateSessionDuration,
  lineCard,
  deviceCard,
  pageCard,
  locationCard,
  sourcesCard,
  languagesCard,
};
