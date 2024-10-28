module.exports = {
  PORT: process.env.PORT || "3000",
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  CORS_ENABLED: process.env.CORS_ENABLED || "false",
  NODE_ENV: process.env.NODE_ENV || "debug",
  MONGODB_CONNECTION_STRING:
    process.env.MONGODB_CONNECTION_STRING ||
    "mongodb://127.0.0.1:27017/TuanaDB",
  JWT: {
    SECRET: process.env.JWT_SECRET || "pdCmaCtZg5b24F7IhLMquTF1BcORCEBM1fBIVSb1",

    EXPIRE_TIME: !isNaN(parseInt(process.env.TOKEN_EXPIRE_TIME))
      ? parseInt(process.env.TOKEN_EXPIRE_TIME)
      : 24 * 60 * 60, // 86400
  },
  DEFAULT_LANG: process.env.DEFAULT_LANG || "EN",
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  REDIS_HOST: process.env.REDIS_HOST || "redis://127.0.0.1:6379",

  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || "localhost",

  MINIO_PORT: process.env.MINIO_PORT || 9000,

  MINIO_USE_SSL: process.env.MINIO_USE_SSL || false,

  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || "NZ3lt2PnvqCJpJWg4O0c",

  MINIO_SECRET_KEY:
    process.env.MINIO_SECRET_KEY || "pdCmaCtZg5b24F7IhLMquTF1BcORCEBM1fBIVSb1",

  DOMAIN: process.env.DOMAIN || "http://localhost",

  WEB_SITE_URL: process.env.WEB_SITE_URL || "http://localhost:3000",

  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || "mybucket",
  
  ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS
};
