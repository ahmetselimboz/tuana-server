const axios = require("axios");
const cheerio = require("cheerio");
const dns = require("dns").promises;
const http = require("http");
const https = require("https");
const { performance } = require("perf_hooks");
const puppeteer = require("puppeteer");
const zlib = require("zlib");
const { URL } = require("url");
var jwa = require("node-jwa");
var jwaConfig = ["408991216", "iU9DXK9rURZ3rKY3PtCEcg"];

// Meta Title Etiketi
async function getMetaTitle(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("title").text() || null;
}

// Meta Description Etiketi
async function getMetaDescription(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('meta[name="description"]').attr("content") || null;
}

// Meta Keyword Etiketi
async function getMetaKeywords(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('meta[name="keywords"]').attr("content") || null;
}

// Meta Author Kullanımı
async function getMetaAuthor(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('meta[name="author"]').attr("content") || null;
}

// Meta Robots Etiketi
async function getMetaRobots(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('meta[name="robots"]').attr("content") || null;
}

// Meta Publisher Etiketi
async function getMetaPublisher(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('meta[name="publisher"]').attr("content") || null;
}

// Twitter Card Meta Etiketi
async function getTwitterCard(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('meta[name="twitter:card"]').attr("content") || null;
}

// Facebook Open Graph Etiketi
async function getFacebookOG(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('meta[property^="og:"]')
    .map((i, el) => ({
      property: $(el).attr("property"),
      content: $(el).attr("content"),
    }))
    .get();
}

// Meta Karakter Etiketi
async function getMetaCharset(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("meta[charset]").attr("charset") || null;
}

// Sayfa Dil Etiketi
async function getLanguage(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("html").attr("lang") || null;
}

// Dış Link Kontrolü
async function getExternalLinks(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('a[href^="http"]')
    .map((i, el) => $(el).attr("href"))
    .get();
}

// Heading Etiket Yapısı
async function getHeadingStructure(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return ["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) => ({
    tag,
    count: $(tag).length,
  }));
}

// Font Boyutları
async function getFontSizes(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const styles = [];
  $("*").each((i, el) => {
    const size = $(el).css("font-size");
    if (size && !styles.includes(size)) styles.push(size);
  });
  return styles;
}

// Yapılandırılmış Veriler
async function getStructuredData(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('script[type="application/ld+json"]')
    .map((i, el) => JSON.parse($(el).html()))
    .get();
}

// 404 Sayfası
async function check404(url) {
  try {
    await axios.get(`${url}/nonexistentpage`);
    return false;
  } catch (error) {
    return error.response?.status === 404;
  }
}

// Canonical
async function getCanonical(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('link[rel="canonical"]').attr("href") || null;
}

// Iframe Kullanımı
async function getIframes(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("iframe")
    .map((i, el) => $(el).attr("src"))
    .get();
}

// Table Etiketi Kullanımı
async function getTables(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("table").length;
}

// Hızlandırılmış Mobil Sayfalar (AMP)
async function checkAMP(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("html[amp]").length > 0;
}

// Favicon Kullanımı
async function getFaviconFunc(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('link[rel="icon"]').attr("href") || null;
}

// Responsive Tasarım Kontrolü
async function checkResponsive(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $('meta[name="viewport"]').attr("content") || null;
}

// Mobil Uyumluluk
async function checkMobileCompatibility(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return (
    $('meta[name="viewport"]')
      .attr("content")
      ?.includes("width=device-width") || false
  );
}

// ALT Etiketi Olmayan Resimler
async function getImagesWithoutAlt(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("img:not([alt])")
    .map((i, el) => $(el).attr("src"))
    .get();
}

// Title Etiketi Olmayan Linkler
async function getLinksWithoutTitle(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("a:not([title])")
    .map((i, el) => $(el).attr("href"))
    .get();
}

// Sunucu Yapılandırması
async function getServerConfiguration(url) {
  const response = await axios.get(url);
  return {
    dnsResolutionTime: response.timing?.dns || null,
    connectionTime: response.timing?.connect || null,
    transferStartTime: response.timing?.startTransfer || null,
    totalTime: response.timing?.total || null,
    gzipEnabled: response.headers["content-encoding"] === "gzip",
    charset: response.headers["content-type"]?.includes("utf-8") || false,
  };
}

// Anahtar Kelime Analizi
async function analyzeKeywords(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const text = $("body").text().toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const frequency = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  return frequency;
}

// Toplam Kaynak Sayısı
async function getResourceCounts(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return {
    js: $("script[src]").length,
    css: $('link[rel="stylesheet"]').length,
    images: $("img").length,
  };
}

async function getDnsResolutionTime(domain) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Create a DevTools Protocol (CDP) session for the page
    const client = await page.createCDPSession();
    await client.send("Performance.enable");

    // Navigate to the URL
    const url = `https://${domain}`;
    await page.goto(url, { waitUntil: "load" });

    // Use PerformanceTiming API to get DNS timing
    const timing = await page.evaluate(() => {
      const { domainLookupStart, domainLookupEnd } = window.performance.timing;
      return {
        dnsStart: domainLookupStart,
        dnsEnd: domainLookupEnd,
      };
    });

    if (timing.dnsStart === 0 || timing.dnsEnd === 0) {
      throw new Error("DNS timing metrics are not available for this page.");
    }

    const dnsResolutionTime = (
      (timing.dnsEnd - timing.dnsStart) /
      1000
    ).toFixed(2); // Time in seconds

    await browser.close();

    return dnsResolutionTime;
  } catch (err) {
    throw new Error(`DNS çözümleme hatası: ${err.message}`);
  }
}
async function getConnectionTime(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now(); // Daha güvenilir zaman ölçümü
    const req = (url.startsWith("https") ? https : http).get(url, (res) => {
      res.on("data", () => {}); // Veri alımı için dinleme (gerekli değil ama burada bırakıyoruz)
      res.on("end", () => {
        const end = Date.now();
        resolve(((end - start) / 1000).toFixed(3)); // Saniye cinsinden
      });
    });
    req.on("error", (err) => {
      reject(`Connection Time Error: ${err.message}`);
    });
    req.end(); // Talebi bitir
  });
}

async function getFirstByteTime(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now(); // Daha güvenilir zaman ölçümü
    const req = (url.startsWith("https") ? https : http).get(url, (res) => {
      res.once("data", () => {
        const end = Date.now();
        resolve(((end - start) / 1000).toFixed(3)); // Saniye cinsinden
      });
    });
    req.on("error", (err) => {
      reject(`First Byte Time Error: ${err.message}`);
    });
    req.end(); // Talebi bitir
  });
}

async function checkGzipSupport(url) {
  try {
    // İstek başlıklarını ayarla
    const headers = {
      "Accept-Encoding": "gzip, deflate, br", // Gzip ve diğer sıkıştırmaları destekliyoruz
      "User-Agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", // SEO botlarını taklit ediyoruz
    };

    // İstek yap
    const response = await axios.get(url, {
      headers,
      timeout: 5000, // Zaman aşımı süresi
    });

    // Yanıt başlıklarından gzip kontrolü
    const encoding = response.headers["content-encoding"];
    return encoding && encoding.includes("gzip") ? "Etkin" : "Pasif";
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP hata kodu: ${error.response.status}`);
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Zaman aşımı: Sunucu yanıt vermedi.");
    } else {
      throw new Error(`Gzip desteği kontrolü başarısız: ${error.message}`);
    }
  }
}
async function getCharsetInfo(url) {
  return new Promise((resolve) => {
    const req = (url.startsWith("https") ? https : http).get(url, (res) => {
      const contentType = res.headers["content-type"];
      const charsetMatch =
        contentType && contentType.match(/charset=([\w-]+)/i);
      resolve(charsetMatch ? charsetMatch[1] : "Belirtilmemiş");
    });
  });
}

async function getTotalTransferredBytes(url) {
  return new Promise((resolve) => {
    let totalBytes = 0;
    const req = (url.startsWith("https") ? https : http).get(url, (res) => {
      res.on("data", (chunk) => {
        totalBytes += chunk.length;
      });
      res.on("end", () => resolve((totalBytes / 1024).toFixed(1) + " KB"));
    });
  });
}

async function analyzePageSpeed(domain, url) {
  try {
    const dnsTime = await getDnsResolutionTime(domain);
    const connectionTime = await getConnectionTime(url);
    const firstByteTime = await getFirstByteTime(url);
    const gzipSupported = await checkGzipSupport(url);
    const charsetInfo = await getCharsetInfo(url);
    const totalBytes = await getTotalTransferredBytes(url);

    return {
      "DNS Çözümleme Süresi": `${dnsTime} Sn`,
      "Bağlantı Kurulana Kadar Geçen Süre": `${connectionTime} Sn`,
      "İlk Bayt Aktarılana Kadar Geçen Süre": `${firstByteTime} Sn`,
      "Dosya Sıkıştırma": gzipSupported,
      "Charset Belirtme": charsetInfo,
      "Toplam Aktarılan Veri": totalBytes,
    };
  } catch (error) {
    console.error("Hata oluştu:", error.message);
  }
}

// Kod ve Yazı Oranı
async function getCodeToTextRatio(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const text = $("body").text().length;
  const code = data.length;
  return {
    ratio: (text / code) * 100,
    pageSize: code,
    textSize: text,
  };
}

// Domain Analizi
async function analyzeDomain(domain) {
    const options = {
        method: 'GET',
        url: 'https://pointsdb-bulk-whois-v1.p.rapidapi.com/whois',
        params: {
          domains: domain,
          format: "split"
        },
        headers: {
          'x-rapidapi-key': 'b0dbddb898msh8b4622a1b9035f7p19ff60jsne02760de4c57',
          'x-rapidapi-host': 'pointsdb-bulk-whois-v1.p.rapidapi.com'
        }
      };

  try {
    const response = await axios.request(options);

    let domainAnalysis = response.data;
    // console.log("🚀 ~ analyzeDomain ~ domainAnalysis:", domainAnalysis)
    const domainData = domainAnalysis[domain];

    // Gerekli bilgileri çıkar
    const registrationDateString = domainData.find((entry) =>
        entry[5]?.includes("Creation Date:")
    )[5].replace("   Creation Date: ", "").trim();

    const expirationDateString = domainData.find((entry) =>
        entry[6]?.includes("Registry Expiry Date:")
    )[6].replace("   Registry Expiry Date: ", "").trim();

    const registrationDate = new Date(registrationDateString);
    const expirationDate = new Date(expirationDateString);
    const today = new Date();

    // Domain yaşı
    const age =
        today.getFullYear() -
        registrationDate.getFullYear() -
        (today < new Date(today.getFullYear(), registrationDate.getMonth(), registrationDate.getDate()) ? 1 : 0);

    // Kalan günlerin hesaplanması
    const remainingDays = Math.max(
        Math.floor((expirationDate - today) / (1000 * 60 * 60 * 24)),
        0
    );

    // İstenen formatta dönüş yap
    return {
        age,
        registrationDate: registrationDate, // Kayıt tarihi (Türkçe format)
        expirationDate: expirationDate, // Süresinin dolacağı tarih (Türkçe format)
        remainingDays,
    };

   
  } catch (error) {
    console.error(error);
  }
}

// Robots.txt Dosyası
async function getRobotsTxt(url) {
  try {
    const { data } = await axios.get(`${url}/robots.txt`);
    return data;
  } catch {
    return null;
  }
}

// Yönlendirme Doğrulaması
async function verifyRedirects(url) {
  const response = await axios.get(url);
  return {
    https: url.startsWith("https://"),
    redirects: response.request.res.responseUrl !== url,
  };
}

async function checkBrokenLinks(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const links = $('a').map((_, el) => $(el).attr('href')).get();

    const brokenLinks = [];
    for (const link of links) {
      try {
        await axios.get(link);
      } catch {
        brokenLinks.push(link);
      }
    }
    return brokenLinks;
  } catch (error) {
    console.error('Site taraması sırasında hata oluştu:', error);
    return [];
  }
}

async function findBacklinkOpportunities(competitors) {
  const backlinks = [];
  for (const competitor of competitors) {
    try {
      const { data } = await axios.get(competitor);
      const $ = cheerio.load(data);
      $('a').each((_, el) => {
        const link = $(el).attr('href');
        if (link && !backlinks.includes(link)) {
          backlinks.push(link);
        }
      });
    } catch (error) {
      console.error(`Rakip analizi sırasında hata: ${competitor}`, error);
    }
  }
  return backlinks;
}

module.exports = {
  getMetaTitle,
  getMetaDescription,
  getMetaKeywords,
  getMetaAuthor,
  getMetaRobots,
  getMetaPublisher,
  getTwitterCard,
  getFacebookOG,
  getMetaCharset,
  getLanguage,
  getExternalLinks,
  getHeadingStructure,
  getFontSizes,
  getStructuredData,
  check404,
  getCanonical,
  getIframes,
  getTables,
  checkAMP,
  getFaviconFunc,
  checkResponsive,
  checkMobileCompatibility,
  getImagesWithoutAlt,
  getLinksWithoutTitle,
  getServerConfiguration,
  analyzeKeywords,
  getResourceCounts,
  analyzePageSpeed,
  getCodeToTextRatio,
  analyzeDomain,
  getRobotsTxt,
  verifyRedirects,
  checkBrokenLinks,
  findBacklinkOpportunities
};
