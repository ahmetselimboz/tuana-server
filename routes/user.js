const _enum = require("../config/enum");
const User = require("../db/models/User");
const RefreshToken = require("../db/models/RefreshToken");
const auditLogs = require("../lib/auditLogs");
const CustomError = require("../lib/error");
const logger = require("../lib/logger/logger");
const Response = require("../lib/response");
const { userExist, createUser } = require("../services/userServices");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const config = require("../config/environments");
const { emailVerify } = require("../lib/sendMail");
const App = require("../db/models/App");
const axios = require("axios");
const puppeteer = require("puppeteer");



router.post("/sign-up", async (req, res) => {
  try {
    const { body } = req;

    const exist = await userExist(body.data.email);

    if (exist) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "User Already Exist!",
        })
      );
    }

    const createdUser = await createUser({
      email: body.data.email,
      password: body.data.password,
      name: body.data.name,
      surname: body.data.surname,
    });

    if (createdUser) {
      return res.status(_enum.HTTP_CODES.CREATED).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.OK,
          message: "Confirmation email sent!",
        })
      );
    }

    throw new CustomError(
      _enum.HTTP_CODES.INT_SERVER_ERROR,
      "/sign-up Error",
      "Something went wrong!"
    );
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error);
    auditLogs.error("" || "User", "user-route", "/sign-up", error);
    logger.error("" || "User", "user-route", "/sign-up", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/google-sign-up", async (req, res) => {
  try {
    const { body } = req;
    const user = await User.findOne({ email: body.data.email });

    if (user) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "User Already Exist!",
          user: user.id,
        })
      );
    }

    const createdUser = await createUser({
      email: body.data.email,
      password: body.data.password,
      name: body.data.name,
      surname: body.data.surname,
      email_is_active: true,
      provider: body.data.provider,
    });

    if (createdUser) {
      return res.status(_enum.HTTP_CODES.CREATED).json(
        Response.successResponse({
          code: _enum.HTTP_CODES.OK,
          message: "Logged In!",
          user: createdUser.id,
        })
      );
    }

    throw new CustomError(
      _enum.HTTP_CODES.INT_SERVER_ERROR,
      "/google-sign-up Error",
      "Something went wrong!"
    );
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error);
    auditLogs.error("" || "User", "user-route", "/google-sign-up", error);
    logger.error("" || "User", "user-route", "/google-sign-up", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/save-token", async (req, res) => {
  try {
    const { token, userId } = req.body;
    console.log("🚀 ~ router.post ~ req.body:", req.body);

    const findToken = await RefreshToken.findOne({ token });
    if (findToken) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Already Exist!",
        })
      );
    }

    await RefreshToken.create({
      token: token,
      userId: userId,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün
    });

    return res.status(_enum.HTTP_CODES.CREATED).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        message: "Saved!",
      })
    );
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error);
    auditLogs.error("" || "User", "user-route", "/save-token", error);
    logger.error("" || "User", "user-route", "/save-token", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.get("/email-confirmed", async (req, res, next) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Token doesn't exist!",
        })
      );
    } else {
      const decoded = jwt.decode(token, config.JWT.SECRET);

      if (!decoded) {
        return res.status(_enum.HTTP_CODES.OK).json(
          Response.serverResponse({
            message: "Token could be broken. Please sign up again!",
          })
        );
      } else {
        const userEmail = decoded.email;

        const emailConfirmed = await User.findOneAndUpdate(
          { email: userEmail },
          { email_is_active: true },
          { new: true }
        );

        if (!emailConfirmed) {
          return res.status(_enum.HTTP_CODES.OK).json(
            Response.serverResponse({
              code: _enum.HTTP_CODES.INT_SERVER_ERROR,
              message: "Email could not be confirmed. Please sign up again!",
            })
          );
        } else {
          return res.status(_enum.HTTP_CODES.OK).json(
            Response.successResponse({
              code: _enum.HTTP_CODES.OK,
              message: "Email Confirmed!",
            })
          );
        }
      }
    }
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/email-confirmed", error);
    logger.error("" || "User", "user-route", "/email-confirmed", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });

    if (!user) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "User couldn't find!",
        })
      );
    }

    if (user && user.email_is_active == false) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Email not confirmed! Please check your email box",
        })
      );
    }

    if (user.provider !== "credentials") {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "This account was created with other methods!",
        })
      );
    }
    const checkPassword = bcrypt.compareSync(password, user.password);

    if (!checkPassword) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Wrong password!",
        })
      );
    }

    const accessToken = jwt.sign({ id: user._id }, config.JWT.SECRET, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign({ id: user._id }, config.JWT.SECRET, {
      expiresIn: "7d",
    });

    // Refresh token'ı veritabanına kaydet
    const tokenDocument = await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün
    });
 
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensures secure cookies in production
      maxAge: 30 * 60 * 1000,
      domain: `.${process.env.TOKEN_DOMAIN}`|| "localhost",
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: `.${process.env.TOKEN_DOMAIN}`|| "localhost",
      path: "/",
    });

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        message: "Welcome!",
      })
    );
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/login", error);
    logger.error("" || "User", "user-route", "/login", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Refresh token missing!",
        })
      );
    }

    const tokenDocument = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDocument || tokenDocument.expires < Date.now()) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.serverResponse({
          code: _enum.HTTP_CODES.INT_SERVER_ERROR,
          message: "Refresh token is invalid or expired!",
        })
      );
    }

    const decoded = jwt.verify(refreshToken, config.JWT.SECRET);

    const newAccessToken = jwt.sign({ id: decoded.id }, config.JWT.SECRET, {
      expiresIn: "30m",
    });
  

    // Yeni access token'ı cookie'ye ekle
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensures secure cookies in production
      maxAge: 30 * 60 * 1000,
      domain: `.${process.env.TOKEN_DOMAIN}`, 
      path: "/",
    });

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        message: "New token created!",
      })
    );
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/refresh-token", error);
    logger.error("" || "User", "user-route", "/refresh-token", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
    
});

router.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await RefreshToken.findOneAndDelete({ token: refreshToken });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        code: _enum.HTTP_CODES.OK,
        message: "Where are you going?",
      })
    );
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/logout", error);
    logger.error("" || "User", "user-route", "/logout", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.get("/get-user", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const findRefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    const findUser = await User.findById(findRefreshToken.userId).select(
      "_id name surname email new mobile_new plans provider createdAt"
    );

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, user: findUser })
      );
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/get-user", error);
    logger.error("" || "User", "user-route", "/get-user", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/set-plan", async (req, res, next) => {
  try {
    const { body } = req;
    const refreshToken = req.cookies.refreshToken;

    const findRefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    const findUser = await User.findByIdAndUpdate(
      findRefreshToken.userId,
      { plans: body.plan },
      { new: true }
    );
    return res
      .status(_enum.HTTP_CODES.OK)
      .json(
        Response.successResponse({ code: _enum.HTTP_CODES.OK, user: findUser })
      );
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/set-plan", error);
    logger.error("" || "User", "user-route", "/set-plan", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

// router.get("/get-user", async (req, res, next) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;

//     const findRefreshToken = await RefreshToken.findOne({
//       token: refreshToken,
//     });

//     const findUser = await User.findById(findRefreshToken.userId).select(
//       "_id name surname email new plans createdAt"
//     );

//     return res
//       .status(_enum.HTTP_CODES.OK)
//       .json(
//         Response.successResponse({ code: _enum.HTTP_CODES.OK, user: findUser })
//       );
//   } catch (error) {
//     auditLogs.error("" || "User", "user-route", "/get-user", error);
//     logger.error("" || "User", "user-route", "/get-user", error);
//     res
//       .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
//       .json(Response.errorResponse(error));
//   }
// });












module.exports = router;
