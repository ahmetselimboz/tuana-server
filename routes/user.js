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

function generateRandomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

async function checkTrackingScript(appId, domain) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`http://${domain}`, { waitUntil: "networkidle2" });

    // Sayfa yüklendikten sonra kısa bir bekleme süresi
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 saniye bekleme süresi

    // `track.js` script'in yüklü olup olmadığını kontrol et
    const hasTrackingScript = await page.evaluate(() =>
      Array.from(document.scripts).some((script) =>
        script.src.includes("/track.js")
      )
    );

    const dataLayerContent = await page.evaluate(() => {
      return new Promise((resolve) => {
        const checkDataLayer = () => {
          if (window.dataLayer && window.dataLayer.length > 0) {
            resolve(window.dataLayer);
          }
        };

        // İlk kontrol
        checkDataLayer();

        // dataLayer güncellenirse tekrar kontrol etmek için MutationObserver kullan
        const observer = new MutationObserver(checkDataLayer);
        observer.observe(document, { childList: true, subtree: true });

        // 5 saniye sonra otomatik olarak kapat
        setTimeout(() => {
          observer.disconnect();
          resolve([]);
        }, 5000);
      });
    });

    console.log("dataLayer içeriği:", dataLayerContent);

    // `dataLayer` ve track komutlarını kontrol et
    const hasDomainTrack = dataLayerContent.some(
      (event) => event[0] === "domain" && event[1] === domain
    );
    const hasConfigTrack = dataLayerContent.some(
      (event) => event[0] === "config" && event[1] === appId
    );

    await browser.close();

    console.log("🚀 ~ checkTrackingScript ~ hasDomainTrack:", hasDomainTrack);
    console.log("🚀 ~ checkTrackingScript ~ hasConfigTrack:", hasConfigTrack);
    // Tüm koşullar sağlanıyorsa script doğru eklenmiştir
    return hasTrackingScript && hasConfigTrack && hasDomainTrack;
  } catch (error) {
    console.error("Hata oluştu:", error);
    await browser.close();
    return false;
  }
}

router.post("/sign-up", async (req, res) => {
  try {
    const { body } = req;

    const exist = await userExist(body.data.email);

    if (exist) {
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/sign-up Error",
        "User Already Exist!"
      );
    }

    const createdUser = await createUser({
      email: body.data.email,
      password: body.data.password,
      name: body.data.name,
      surname: body.data.surname,
    });

    if (createdUser) {
      return res
        .status(_enum.HTTP_CODES.CREATED)
        .json(
          Response.successResponse({ message: "Confirmation email sent!" })
        );
    }

    throw new CustomError(
      _enum.HTTP_CODES.INT_SERVER_ERROR,
      "/sign-up Error",
      "Something went wrong!"
    );
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/sign-up", error);
    logger.error("" || "User", "user-route", "/sign-up", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.get("/email-confirmed", async (req, res, next) => {
  try {
    const token = req.query.token;

    if (!token) {
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/email-confirmed Error",
        "Token doesn't exist!"
      );
    } else {
      const decoded = jwt.decode(token, config.JWT.SECRET);

      if (!decoded) {
        throw new CustomError(
          _enum.HTTP_CODES.INT_SERVER_ERROR,
          "/email-confirmed Error",
          "Token could be broken. Please sign up again!"
        );
      } else {
        const userEmail = decoded.email;

        const emailConfirmed = await User.findOneAndUpdate(
          { email: userEmail },
          { email_is_active: true },
          { new: true }
        );

        if (!emailConfirmed) {
          throw new CustomError(
            _enum.HTTP_CODES.INT_SERVER_ERROR,
            "/email-confirmed Error",
            "Email could not be confirmed. Please sign up again!"
          );
        } else {
          return res
            .status(_enum.HTTP_CODES.OK)
            .json(Response.successResponse({ message: "Email Confirmed!" }));
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
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/login Error",
        "User couldn't find!"
      );
    }

    if (user && user.email_is_active == false) {
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/login Error",
        "Email not confirmed! Please check your email box"
      );
    }
    const checkPassword = bcrypt.compareSync(password, user.password);

    if (!checkPassword) {
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/login Error",
        "Wrong password!"
      );
    }

    const accessToken = jwt.sign({ id: user._id }, config.JWT.SECRET, {
      expiresIn: "15m",
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
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ message: "Welcome!" }));
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
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/refresh-token Error",
        "Refresh token missing!"
      );
    }

    const tokenDocument = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDocument || tokenDocument.expires < Date.now()) {
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/refresh-token Error",
        "Refresh token is invalid or expired!"
      );
    }

    const decoded = jwt.verify(refreshToken, config.JWT.SECRET);

    const newAccessToken = jwt.sign({ id: decoded.id }, config.JWT.SECRET, {
      expiresIn: "15m",
    });

    // Yeni access token'ı cookie'ye ekle
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ message: "New token created!" }));
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

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ message: "Where are you going?" }));
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
      "_id name surname email new plans createdAt"
    );

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ user: findUser }));
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
      .json(Response.successResponse({ user: findUser }));
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/set-plan", error);
    logger.error("" || "User", "user-route", "/set-plan", error);
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
      "_id name surname email new plans createdAt"
    );

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ user: findUser }));
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/get-user", error);
    logger.error("" || "User", "user-route", "/get-user", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
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
      .json(Response.successResponse({ appId }));
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/get-appid", error);
    logger.error("" || "User", "user-route", "/get-appid", error);
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
    }).save();

    await User.findByIdAndUpdate(
      findRefreshToken.userId,
      {
        $push: { apps: { appId: app._id } },
      },
      { new: true }
    );

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ status: true }));
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/create-project", error);
    logger.error("" || "User", "user-route", "/create-project", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { appId, domain } = req.body;
    const refreshToken = req.cookies.refreshToken;
    console.log("🚀 ~ router.post ~ body:", req.body);

    // const findApp = await App.findOne({ appId, domain });

    // if (!findApp) {
    //   throw new CustomError(
    //     _enum.HTTP_CODES.INT_SERVER_ERROR,
    //     "/verify",
    //     "Wrong snippet!"
    //   );
    // }

    const isExist = await checkTrackingScript(appId, domain);

    if (!isExist) {
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/verify",
        "Make sure you paste the correct snippet!"
      );
    }

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ message: "You can start!" }));
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/verify", error);
    logger.error("" || "User", "user-route", "/verify", error);
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
        Response.successResponse({
          status: false,
          message: "Domain is required!",
        })
      );
    }

    if (/^(https?:\/\/|www\.)/i.test(body.domain)) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          status: false,
          message:
            "The domain must be a bare domain name only, it cannot contain 'https://', 'http://' or 'www'!",
        })
      );
    }

    const findApp = await App.findOne({ domain: body.domain });
    if (findApp) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          status: false,
          message: "This domain is already exist!",
        })
      );
    }

    return res.status(_enum.HTTP_CODES.OK).json(
      Response.successResponse({
        status: true,
        message: "Domain is available!",
      })
    );
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/exist-domain", error);
    logger.error("" || "User", "user-route", "/exist-domain", error);
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
      .select("apps")
      .sort({ createdAt: "desc" });

    return res
      .status(_enum.HTTP_CODES.OK)
      .json(Response.successResponse({ list: findAppList }));
  } catch (error) {
    auditLogs.error("" || "User", "user-route", "/get-project-list", error);
    logger.error("" || "User", "user-route", "/get-project-list", error);
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
      { appId:body.appId },
      { pin: !findApp.pin },
      { new: true }
    );

    if (app.pin) {
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          message: "Pinned!",
        })
      );
    }else if(!app.pin){
      return res.status(_enum.HTTP_CODES.OK).json(
        Response.successResponse({
          status: true,
          message: "Pin removed!",
        })
      );
    }else{
      throw new CustomError(
        _enum.HTTP_CODES.INT_SERVER_ERROR,
        "/toggle-pin Error",
        "Try again!"
      );
    }

 
  } catch (error) {
    
    auditLogs.error("" || "User", "user-route", "/toggle-pin", error);
    logger.error("" || "User", "user-route", "/toggle-pin", error);
    res
      .status(_enum.HTTP_CODES.INT_SERVER_ERROR)
      .json(Response.errorResponse(error));
  }
});

module.exports = router;
