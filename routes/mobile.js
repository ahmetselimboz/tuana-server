const _enum = require("../config/enum");
const User = require("../db/models/User");
const RefreshToken = require("../db/models/RefreshToken");
const auditLogs = require("../lib/auditLogs");
const CustomError = require("../lib/error");
const logger = require("../lib/logger/logger");
const Response = require("../lib/response");
const router = require("express").Router();
const config = require("../config/environments");
const Version = require("../db/models/Versions");

router.get("/check-version", async (req, res, next) => {
  try {
    const { body } = req;
    const { type } = req.query;
    if (!type || (type !== "android" && type !== "ios")) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message:
            "Invalid or missing type parameter. Please provide 'android' or 'ios'",
        })
      );
    }
    let versionExist = await Version.findOne({});
    if (!versionExist) {
      await new Version().save();
    }

    let version = await Version.findOne({});

    if (version) {
      const currentVersion = version[type]; // Access the platform-specific version
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.OK,
          message: `Current version for ${type}: ${currentVersion}`,
          version: currentVersion,
        })
      );
    } else {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Version information not found!",
        })
      );
    }
  } catch (error) {
    auditLogs.error("" || "User", "mobile-route", "/check-version", error);
    logger.error("" || "User", "mobile-route", "/check-version", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/onboarding", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const findRefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    const findUser = await User.findByIdAndUpdate(findRefreshToken.userId, {mobile_new: false}, {
      new: true,
    });

    if (findUser?.mobile_new == false) {
  
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.OK,
          status:true
        })
      );
    } else {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          status:false
        })
      );
    }
  } catch (error) {
    auditLogs.error("" || "User", "mobile-route", "/onboarding", error);
    logger.error("" || "User", "mobile-route", "/onboarding", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

module.exports = router;
