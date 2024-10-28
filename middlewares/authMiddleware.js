const jwt = require("jsonwebtoken");
const config = require("../config/environments");
const auditLogs = require("../lib/auditLogs");
const logger = require("../lib/logger/logger");
const CustomError = require("../lib/error");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.accessToken; 
    if (!token) {
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/refresh-token Error",
        "Your session has expired!"
      );
    }
    const decoded = jwt.verify(token, config.JWT.SECRET);
    next();
  } catch (err) {
    auditLogs.error("" || "User", "authMiddleware", "authMiddleware", error);
    logger.error("" || "User", "authMiddleware", "authMiddleware", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(err));
  }
};

module.exports = authMiddleware;
