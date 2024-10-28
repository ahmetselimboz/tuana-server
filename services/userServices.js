const User = require("../db/models/User");
const auditLogs = require("../lib/auditLogs");
const logger = require("../lib/logger/logger");
const { emailVerify } = require("../lib/sendMail");
var jwt = require("jsonwebtoken");
const config = require("../config/environments");

const userExist = async (email) => {
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (user && user.email_is_active == true) {
      return true;
    }
    if (user && user.email_is_active == false) {
      await User.findOneAndDelete({ email });
      return false;
    }

    return false;
  } catch (error) {
    console.log("🚀 ~ userExist ~ error:", error);
    auditLogs.error("" || "User", "userServices", "userExist", error);
    logger.error("" || "User", "userServices", "userExist", error);
  }
};

const createUser = async (data) => {
  try {
    const createdUser = await User(data).save();

    if (createdUser) {
      const payload = {
        id: createdUser.id,
        email: createdUser.email,
      };

      const token = jwt.sign(payload, config.JWT.SECRET, {
        expiresIn: 60 * 30,
      });

      const url = config.WEB_SITE_URL + "/email-confirmed?token=" + token;

      await emailVerify(
        [createdUser.email],
        createdUser.name,
        createdUser.surname,
        url
      );

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("🚀 ~ createUser ~ error:", error);
    auditLogs.error("" || "User", "userServices", "createUser", error);
    logger.error("" || "User", "userServices", "createUser", error);
  }
};

module.exports = {
  userExist,
  createUser,
};
