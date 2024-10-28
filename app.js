require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const customMorganLogger = require("./lib/morgan");
const chalk = require("chalk");
const cors = require("cors");
var indexRouter = require("./routes/index");
const { CORS_ENABLED, ALLOWED_DOMAINS } = require("./config/environments");

var app = express();

if (CORS_ENABLED) {
  const allowedDomains = ALLOWED_DOMAINS.split(",");

  const corsOptions = {
    origin: (origin, callback) => {
      if (origin !== undefined || allowedDomains.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("🚀 ~ origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
} else {
  app.use(
    cors({
      origin: "http://localhost:3000", 
      credentials: true, 
    })
  );
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(customMorganLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);

// error handler
app.use(function (err, req, res, next) {
  console.log(chalk.red(err));
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(505).json({ error: err.message });
});

module.exports = app;
