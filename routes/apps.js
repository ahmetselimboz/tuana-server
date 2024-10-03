const _enum = require("../config/enum");
const App = require("../db/models/App");
const auditLogs = require("../lib/auditLogs");
const logger = require("../lib/logger/logger");
const Response = require("../lib/response");
const {
  findTopPage,
  newVisitors,
  calculateSessionDuration,
  lineCard,
  deviceCard,
  pageCard,
  locationCard,
} = require("../services/appServices");

const router = require("express").Router();

router.post("/new-visitor", async (req, res) => {
  try {
    const { body } = req;

    const result = await newVisitors(body);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ visitor: result.length }));
  } catch (error) {
    console.log("🚀 ~ /new-visitor ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /new-visitor", error);
    logger.error("" || "User", "Apps", "POST /new-visitor", error);
  }
});

router.post("/top-page", async (req, res) => {
  try {
    const { body } = req;
    const result = await findTopPage(body);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ url: result }));
  } catch (error) {
    console.log("🚀 ~ /top-page ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /top-page", error);
    logger.error("" || "User", "Apps", "POST /top-page", error);
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

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ duration: result }));
  } catch (error) {
    console.log("🚀 ~ /avg-duration ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /avg-duration", error);
    logger.error("" || "User", "Apps", "POST /avg-duration", error);
  }
});

router.post("/line-card", async (req, res) => {
  try {
    const { body, query } = req;
    const result = await lineCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ visitor: result.result, duration: result.duration }));
  } catch (error) {
    console.log("🚀 ~ /line-card ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /line-card", error);
    logger.error("" || "User", "Apps", "POST /line-card", error);
  }
});

router.post("/device-card", async (req, res) => {
  try {
    const { body, query } = req;
    
    const result = await deviceCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ data: result }));
  } catch (error) {
    console.log("🚀 ~ /device-card ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /device-card", error);
    logger.error("" || "User", "Apps", "POST /device-card", error);
  }
});

router.post("/page-card", async (req, res) => {
  try {
    const { body, query } = req;
    
    const result = await pageCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ data: result }));
  } catch (error) {
    console.log("🚀 ~ /device-card ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /device-card", error);
    logger.error("" || "User", "Apps", "POST /device-card", error);
  }
});

router.post("/location-card", async (req, res) => {
  try {
    const { body, query } = req;
    
    const result = await locationCard(body, query);

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ data: result }));
  } catch (error) {
    console.log("🚀 ~ /location-card ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /location-card", error);
    logger.error("" || "User", "Apps", "POST /location-card", error);
  }
});
module.exports = router;
