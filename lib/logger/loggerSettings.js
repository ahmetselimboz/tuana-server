var winston = require("winston");
const { LOG_LEVEL } = require("../../config/index");
const path = require('path');

const formats = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.simple(),
 
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: [username:${info.message.username}] [location:${info.message.location}] [procType:${info.message.proc_type}] [log:${info.message.log}]`
  )
);

const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/info.log"), format: formats }),
    new winston.transports.Console({ format: formats }),
  ],
});

module.exports = logger;