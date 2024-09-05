var morgan = require("morgan");
const chalk = require("chalk");

const colorizeStatusCode = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      // 2xx (Başarılı) durum kodları için yeşil renk
      return chalk.green(statusCode);
    } else if (statusCode >= 400 && statusCode < 500) {
      // 4xx (İstemci Hatası) durum kodları için sarı renk
      return chalk.yellow(statusCode);
    } else if (statusCode >= 500) {
      // 5xx (Sunucu Hatası) durum kodları için kırmızı renk
      return chalk.red(statusCode);
    }
    // Diğer durumlar için beyaz renk
    return null;
  };
  
  // Özel bir morgan işlevi oluştur
  const customMorganLogger = morgan((tokens, req, res) => {
    // HTTP durum kodunu al
    const statusCode = res.statusCode;
  
    // Renkli HTTP durum kodunu döndür
    const coloredStatusCode = colorizeStatusCode(statusCode);
  
    if (coloredStatusCode != null) {
      return `${tokens.method(req, res)} ${coloredStatusCode} ${tokens.url(
        req,
        res
      )}  ${tokens["response-time"](req, res)} ms`;
    }
  });

  module.exports = customMorganLogger