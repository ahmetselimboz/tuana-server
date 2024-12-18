const App = require("../db/models/App");
const logger = require("../lib/logger/logger");
const auditLogs = require("../lib/auditLogs");
const moment = require("moment");
const CustomError = require("../lib/error");
const _enum = require("../config/enum");

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
    if (!visitors || visitors.length === 0) return [];

    // lastdate için UTC başlangıç ve bitiş saatlerini ayarla
    const lastDateStart = new Date(lastdate);
    lastDateStart.setUTCHours(0, 0, 0, 0);

    const lastDateEnd = new Date(lastdate);
    lastDateEnd.setUTCHours(23, 59, 59, 999);

    if (!firstdate || firstdate === "null") {
      // Sadece lastdate'in olduğu gün
      return visitors.filter((item) => {
        const date = new Date(item.date);
        return date >= lastDateStart && date <= lastDateEnd;
      });
    } else {
      // Hem firstdate hem lastdate doluysa aralığı kontrol et
      const firstDateStart = new Date(firstdate);
      firstDateStart.setUTCHours(0, 0, 0, 0);

      return visitors.filter((item) => {
        const date = new Date(item.date);
        return date >= firstDateStart && date <= lastDateEnd;
      });
    }
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
              language: data.language,
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
                language: data.language,
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
    let totalVisitor = await App.findOne({ appId: body.appId }).select(
      "visitor.date visitor._id visitor.new "
    );
    let newVisitors =
      totalVisitor?.visitor?.filter((visitor) => visitor.new) || [];

    newVisitors = newVisitors.map((item) => ({
      _id: item._id,
      new: item.new,
      date: item.date,
    }));

    const lastdate = new Date();
    const firstdate = null;

    const newVisitorsResult = filterVisitorsByDate(
      newVisitors,
      firstdate,
      lastdate
    );

    return newVisitorsResult.length;
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
    const filteredData = filterVisitorsByDate(
      data,
      body.firstdate,
      body.lastdate
    );

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

    // Ziyaretçileri getir
    let totalVisitor = await App.findOne({ appId: body.appId }).select(
      "visitor.date visitor._id visitor.new visitor.data.date visitor.data.type"
    );
    const totalVisitorData = totalVisitor?.visitor.map((item) => ({
      _id: item._id,
      new: item.new,
      date: item.date,
    }));

    // Ziyaretçileri tarih aralığına göre filtrele
    const totalVisitorResult = await filterVisitorsByDate(
      totalVisitorData,
      firstdate,
      lastdate
    );

    // Ziyaretçi datalarının içindeki "page_view" verilerini tarih aralığına göre filtrele
    const totalPage =
      totalVisitor?.visitor?.flatMap((visitor) =>
        visitor?.data?.filter((item) => item.type === "page_view")
      ) || [];

    const totalPageRange = filterVisitorsByDate(totalPage, firstdate, lastdate);

    // Yeni ziyaretçileri al ve tarih aralığına göre filtrele
    let newVisitors =
      totalVisitor?.visitor?.filter((visitor) => visitor.new) || [];

    newVisitors = newVisitors.map((item) => ({
      _id: item._id,
      new: item.new,
      date: item.date,
    }));

    const newVisitorsResult = filterVisitorsByDate(
      newVisitors,
      firstdate,
      lastdate
    );

    // Zaman dilimini getir
    const timezone = await App.findOne({ appId: body.appId }).select(
      "timezone"
    );

    // Sonucu döndür
    const result = {
      timezone: timezone?.timezone || "Unknown",
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

    // Veritabanından ziyaretçilerin verilerini çek
    const totalPageResult = await App.find({ appId: body.appId }).select(
      "visitor.data.userDevice visitor.data.date visitor.data.type"
    );

    // "page_view" türündeki verileri topla
    const totalPage = totalPageResult.flatMap((app) =>
      app.visitor.flatMap((visitor) =>
        visitor.data.filter((item) => item.type === "page_view")
      )
    );

    // Tarih aralığına göre filtrele
    const totalPageRange = filterVisitorsByDate(totalPage, firstdate, lastdate);

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

    // Veritabanından "data" alanını çek
    const totalPageResult = await App.find({ appId: body.appId }).select(
      "visitor"
    );

    // "page_view" türündeki tüm sayfa görünümlerini topla
    const totalPage = totalPageResult.flatMap((app) =>
      app.visitor.flatMap((visitor) =>
        visitor.data.filter((item) => item.type === "page_view")
      )
    );

    // Tarih aralığına göre filtreleme
    const totalPageRange = filterVisitorsByDate(totalPage, firstdate, lastdate);

    // Sayfa görünümlerini gruplama
    const pageViews = totalPageRange.reduce((acc, page) => {
      const route = page.url;

      if (!acc[route]) {
        acc[route] = 0;
      }

      acc[route] += 1;

      return acc;
    }, {});

    // Sayfa görünümlerini formatlama
    const formattedPageViews = Object.keys(pageViews).map((route) => ({
      route,
      visitor: pageViews[route].toString(),
    }));

    // Sonuç döndürme
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

    // Tüm data alanını al
    const totalPageResult = await App.find({ appId: body.appId }).select(
      "visitor"
    );

    // "page_view" türündeki verileri düzleştir ve filtrele
    const totalPage = totalPageResult.flatMap((app) =>
      app.visitor.flatMap((visitor) =>
        visitor.data
          .filter((item) => item.type === "page_view")
          .map((item) => ({
            location: item.location,
            date: item.date,
          }))
      )
    );

    // Tarih aralığına göre filtrele
    const totalPageRange = filterVisitorsByDate(totalPage, firstdate, lastdate);

    // Ülke bazlı benzersiz ziyaretçi sayısını hesapla
    const countriesData = {};

    totalPageRange.forEach((entry) => {
      const country = entry.location?.country || "Unknown";

      countriesData[country] = (countriesData[country] || 0) + 1;
    });

    // Ülke verilerini formatla
    const locationData = Object.entries(countriesData).map(
      ([country, visitor]) => ({ country, visitor })
    );

    // Sonuç
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

    // Veritabanından gerekli visitor verisini çek
    const totalPageResult = await App.find({ appId: body.appId }).select(
      "visitor"
    );

    // "page_view" türündeki verileri düzleştir ve filtrele
    const totalPage = totalPageResult.flatMap((app) =>
      app.visitor.flatMap((visitor) =>
        visitor.data
          .filter((item) => item.type === "page_view") // Sadece "page_view" türündeki verileri al
          .map((item) => ({
            referrer: item.referrer,
            date: item.date,
          }))
      )
    );

    // Tarih aralığına göre filtreleme
    const totalPageRange = await filterVisitorsByDate(
      totalPage,
      firstdate,
      lastdate
    );

    // Referrer alanına göre domain sayımı
    const referrerCounts = {};

    totalPageRange.forEach((item) => {
      const domain = getDomainFromReferrer(item.referrer) || "Direct/None";

      // Referrer'i say
      referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
    });

    // Referrer verilerini formatla
    const sources = Object.entries(referrerCounts).map(([domain, visitor]) => ({
      route: domain,
      visitor,
    }));

    // Sonuç objesi
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
    console.log("🚀 ~ languagesCard ~ lastdate:", lastdate);
    console.log("🚀 ~ languagesCard ~ firstdate:", firstdate);

    // Veritabanından gerekli veriyi çek
    const totalPageResult = await App.find({ appId: body.appId }).select(
      "visitor.language visitor.date "
    );

    // "page_view" türündeki verileri filtrele
    // const totalPage = totalPageResult.flatMap((app) =>
    //   app.visitor.flatMap(
    //     (visitor) => visitor.data.filter((item) => item.type === "page_view") // Sadece "page_view" türündeki verileri al
    //   )
    // );

    // Tarih aralığına göre filtreleme
    const totalPageRange = await filterVisitorsByDate(
      totalPageResult[0]?.visitor,
      firstdate,
      lastdate
    );
    // return totalPageRange

    // Dil bazlı ziyaretçi sayımı
    const languageCount = {};

    totalPageRange.forEach((entry) => {
      const lang = entry.language;

      // Dil sayısını artır
      if (languageCount[lang]) {
        languageCount[lang]++;
      } else {
        languageCount[lang] = 1;
      }
    });

    // Sonuç objesi
    const result = {
      uniqueVisitor: Object.values(languageCount),
      languages: Object.keys(languageCount),
    };

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
