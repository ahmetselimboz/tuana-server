const _enum = require("../config/enum");
const App = require("../db/models/App");
const RefreshToken = require("../db/models/RefreshToken");
const User = require("../db/models/User");
const auditLogs = require("../lib/auditLogs");
const logger = require("../lib/logger/logger");
const Response = require("../lib/response");
const config = require("../config/environments");

const {
  findTopPage,
  newVisitors,
  calculateSessionDuration,
  lineCard,
  deviceCard,
  pageCard,
  locationCard,
  sourcesCard,
  languagesCard,
  checkTrackingScript,
  generateRandomCode,
  getFavicon,
} = require("../services/appServices");
const axios = require("axios");
const puppeteer = require("puppeteer");
const getPlatormData = require("../lib/playwright");
const AI = require("../db/models/Ai");

const router = require("express").Router();


router.post("/new-visitor", async (req, res) => {
  try {
    const { body } = req;

    const result = await newVisitors(body);

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        visitor: result,
      })
    );
  } catch (error) {
    console.log("🚀 ~ /new-visitor ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /new-visitor", error);
    logger.error("" || "User", "apps-route", "POST /new-visitor", error);
  }
});

router.post("/top-page", async (req, res) => {
  try {
    const { body } = req;
    const result = await findTopPage(body);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, url: result })
      );
  } catch (error) {
    console.log("🚀 ~ /top-page ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /top-page", error);
    logger.error("" || "User", "apps-route", "POST /top-page", error);
  }
});

router.post("/avg-duration", async (req, res) => {
  try {
    const { body } = req;
    const result = await calculateSessionDuration({
      appId: body.appId,
      firstdate: "null",
      lastdate: new Date(),
    });

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        duration: result,
      })
    );
  } catch (error) {
    console.log("🚀 ~ /avg-duration ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /avg-duration", error);
    logger.error("" || "User", "apps-route", "POST /avg-duration", error);
  }
});

router.post("/line-card", async (req, res) => {
  try {
    const { body } = req;
    console.log("🚀 ~ /line-card ~ body:", body)
    const query = body.query;

   

   // console.log("🚀 ~ lineCard ~ query:", query);

    const result = await lineCard(body, query);

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        data: result.result,
      })
    );
  } catch (error) {
    console.log("🚀 ~ /line-card ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /line-card", error);
    logger.error("" || "User", "apps-route", "POST /line-card", error);
  }
});

router.post("/device-card", async (req, res) => {
  try {
    const { body } = req;
    const query = body.query;
    const result = await deviceCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, data: result })
      );
  } catch (error) {
    console.log("🚀 ~ /device-card ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /device-card", error);
    logger.error("" || "User", "apps-route", "POST /device-card", error);
  }
});

router.post("/page-card", async (req, res) => {
  try {
    const { body } = req;
    const query = body.query;
    const result = await pageCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, data: result })
      );
  } catch (error) {
    console.log("🚀 ~ /device-card ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /device-card", error);
    logger.error("" || "User", "apps-route", "POST /device-card", error);
  }
});

router.post("/location-card", async (req, res) => {
  try {
    const { body } = req;
    const query = body.query;
    const result = await locationCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, data: result })
      );
  } catch (error) {
    console.log("🚀 ~ /location-card ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /location-card", error);
    logger.error("" || "User", "apps-route", "POST /location-card", error);
  }
});

router.post("/sources-card", async (req, res) => {
  try {
    const { body } = req;
    const query = body.query;
    const result = await sourcesCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, data: result })
      );
  } catch (error) {
    console.log("🚀 ~ /location-card ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /location-card", error);
    logger.error("" || "User", "apps-route", "POST /location-card", error);
  }
});

router.post("/languages-card", async (req, res) => {
  try {
    const { body } = req;
  
    const query = body.query;

    const result = await languagesCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, data: result })
      );
  } catch (error) {
    console.log("🚀 ~ /languages-card ~ error:", error);
    auditLogs.error("" || "User", "apps-route", "POST /languages-card", error);
    logger.error("" || "User", "apps-route", "POST /languages-card", error);
  }
});


router.get("/get-appid", async (req, res, next) => {
  try {
    while (true) {
      var appId = generateRandomCode();

      const findApp = await App.findOne({ appId });

      if (!findApp) {
        break;
      }
    }

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ code: _enum.HTTP_CODES.OK, appId }));
  } catch (error) {
    auditLogs.error("" || "User", "apps-route", "/get-appid", error);
    logger.error("" || "User", "apps-route", "/get-appid", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/create-project", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { body } = req;

    const findRefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    const app = await App({
      userId: findRefreshToken.userId,
      appId: body.appId,
      timezone: body.timezone,
      domain: body.domain,
      type: body.type,
      project_name: body.project_name,
      active: true,
      favicon: body.type == "Web" ? getFavicon() : ""
    }).save();

    await User.findByIdAndUpdate(
      findRefreshToken.userId,
      {
        $push: { apps: { appId: app._id } },
      },
      { new: true }
    );

    const userInfo = await User.findOne({appId:appId})

    const planValues = {
      free: 5,
      mini: 10,
      pro: 20,
      premium: 0
    };

    const tokenValues = {
      free: 1024,
      mini: 2048,
      pro: 3072,
      premium: 4096
    };

    const ai = await AI({
      userId: findRefreshToken.userId,
      appId: body.appId,
      limitExist: userInfo.plans == "free" ? true : false,
      limit:  planValues[userInfo.plans] ?? null,
      wordLimit: tokenValues[userInfo.plans] ?? null,
      ai_limit:  planValues[userInfo.plans] ?? null,
    }).save()

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, status: true })
      );
  } catch (error) {
    auditLogs.error("" || "User", "apps-route", "/create-project", error);
    logger.error("" || "User", "apps-route", "/create-project", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/exist-domain", async (req, res, next) => {
  try {
    const { body } = req;

    if (body.domain === "" || body.domain === null) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Domain is required!",
        })
      );
    }

    if (/^(https?:\/\/|www\.)/i.test(body.domain)) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message:
            "The domain must be a bare domain name only, it cannot contain 'https://', 'http://' or 'www'!",
        })
      );
    }

    const findApp = await App.findOne({ domain: body.domain });
    if (findApp) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "This domain is already exist!",
        })
      );
    }

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        message: "Domain is available!",
      })
    );
  } catch (error) {
    auditLogs.error("" || "User", "apps-route", "/exist-domain", error);
    logger.error("" || "User", "apps-route", "/exist-domain", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { appId, domain } = req.body;
    const refreshToken = req.cookies.refreshToken;

    const isExist = await checkTrackingScript(appId, domain);

    if (!isExist) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Make sure you paste the correct snippet!",
        })
      );
    }

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        message: "You can start!",
      })
    );
  } catch (error) {
    auditLogs.error("" || "User", "apps-route", "/verify", error);
    logger.error("" || "User", "apps-route", "/verify", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.get("/get-project-list", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { body } = req;

    const findRefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    const findAppList = await User.findById(findRefreshToken.userId)
      .populate({
        path: "apps.appId",
        select: "appId type project_name pin active createdAt domain",
      })
      .select("apps");

    const sortedApps = findAppList.apps.sort((a, b) => {
      if (a.appId.pin === b.appId.pin) {
        return new Date(b.appId.createdAt) - new Date(a.appId.createdAt);
      }
      return b.appId.pin - a.appId.pin;
    });

    findAppList.apps = sortedApps;

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        list: findAppList.apps,
      })
    );
  } catch (error) {
    auditLogs.error("" || "User", "apps-route", "/get-project-list", error);
    logger.error("" || "User", "apps-route", "/get-project-list", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/toggle-pin", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { body } = req;

    const findRefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    const findApp = await App.findOne({
      appId: body.appId,
      userId: findRefreshToken.userId,
    });

    const app = await App.findOneAndUpdate(
      { appId: body.appId },
      { pin: !findApp.pin },
      { new: true }
    );

    if (app.pin) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.OK,
          message: "Pinned!",
        })
      );
    } else if (!app.pin) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.OK,
          message: "Pin removed!",
        })
      );
    } else {
      return res.status(_enum.HTTP_CODES.INT_SERVER_ERROR).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Try again!",
        })
      );
    }
  } catch (error) {
    auditLogs.error("" || "User", "apps-route", "/toggle-pin", error);
    logger.error("" || "User", "apps-route", "/toggle-pin", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/track-exit-event", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { body } = req;

    console.log("🚀 ~ Gelen Exit Event Verisi:", body);

    await App.findOneAndUpdate(
      { appId: body.appId, "visitor.session": body.session },
      {
        $push: {
          "visitor.$[elem].data": {
            type: body.type,
            details: body.data || {},
            url: body.url,
            referrer: body.referrer || "Direct/None",
            userDevice: {
              browser: body.userDevice.browser,
              engine: body.userDevice.engine,
              os: body.userDevice.os,
              device: body.userDevice.device,
            },
            location: {
              country: body.location.country,
              city: body.location.city || "",
            },
            screenResolution: body.screenResolution,
            language: body.language,
          },
        },
      },
      {
        arrayFilters: [{ "elem.session": body.session }], // Doğru `visitor` öğesini seç
        new: true, // Güncellenmiş belgeyi döner
      }
    );

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        status: true,
      })
    );
  } catch (error) {
    auditLogs.error("" || "User", "apps-route", "/track-exit-event", error);
    logger.error("" || "User", "apps-route", "/track-exit-event", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});



module.exports = router;
