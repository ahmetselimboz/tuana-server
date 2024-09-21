const _enum = require("../config/enum");
const App = require("../db/models/App");
const auditLogs = require("../lib/auditLogs");
const logger = require("../lib/logger/logger");
const Response = require("../lib/response");
const { findTopPage, newVisitors, calculateSessionDuration } = require("../services/appServices");
const router = require("express").Router();

router.post("/new-visitor", async (req, res) => {
  try {
    const { body } = req;

    const result = await newVisitors(body)
    
   
    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ visitor:result.length }));
  } catch (error) {
    console.log("🚀 ~ new-visitor ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /new-visitor", error);
    logger.error("" || "User", "Apps", "POST /new-visitor", error);
  }
});

router.post("/top-page", async (req, res) => {
  try {

    const { body } = req;
    const result = await findTopPage(body)
   
    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ url: result }));
  } catch (error) {
    console.log("🚀 ~ new-visitor ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /new-visitor", error);
    logger.error("" || "User", "Apps", "POST /new-visitor", error);
  }
});

router.post("/avg-duration", async (req, res) => {
  try {

    const { body } = req;
    const result = await calculateSessionDuration(body)
   console.log(result);
    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ duration: result }));
  } catch (error) {
    console.log("🚀 ~ new-visitor ~ error:", error);
    auditLogs.error("" || "User", "Apps", "POST /new-visitor", error);
    logger.error("" || "User", "Apps", "POST /new-visitor", error);
  }
});


module.exports = router;
