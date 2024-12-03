const { chromium } = require("playwright");

const getPlatformData = async (link) => {
  try {
    console.log("🚀 ~ getPlatformData ~ link:", link);

    // Tarayıcı başlat
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Hedef siteye git ve dinamik içeriği bekle
    await page.goto(`https://${link}`, { waitUntil: "networkidle" });
    await page.waitForSelector(".dynamic-content");

    // Sayfa başlığını ve dinamik içeriği al
    const title = await page.title();
    const dynamicContent = await page.textContent(".dynamic-content");

    // Performans zamanlamalarını al
    const performanceTiming = await page.evaluate(() => {
      const [navigationTiming] = performance.getEntriesByType("navigation");
      return navigationTiming ? navigationTiming.toJSON() : null;
    });

    // Tüm meta etiketleri al
    const metaTags = await page.$$eval("meta", (metas) =>
      metas.map((meta) => ({
        name: meta.getAttribute("name"),
        content: meta.getAttribute("content"),
      }))
    );

    // Tüm linkleri al
    const links = await page.$$eval("a", (anchors) =>
      anchors.map((anchor) => anchor.href)
    );

    // Tüm resim URL'lerini al
    const images = await page.$$eval("img", (imgs) =>
      imgs.map((img) => img.src)
    );

    // Çerezleri al
    const cookies = await page.context().cookies();

    // Yerel depolama verilerini al
    const localStorageData = await page.evaluate(() =>
      Object.entries(localStorage).map(([key, value]) => ({ key, value }))
    );

    // Sayfada aşağı kaydır
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Kaydırma yüzdesi
    const scrollPercentage = await page.evaluate(() => {
      return (
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) *
        100
      );
    });

    // Kampanya verilerini al
    const urlParams = new URLSearchParams(page.url());
    const campaignData = {
      source: urlParams.get("utm_source"),
      medium: urlParams.get("utm_medium"),
      campaign: urlParams.get("utm_campaign"),
    };

    // Verileri JSON formatında birleştir
    const result = {
      title,
      dynamicContent,
      performanceTiming,
      metaTags,
      links,
      images,
      cookies,
      localStorageData,
      scrollPercentage: scrollPercentage.toFixed(2),
      campaignData,
    };

    // Tarayıcıyı kapat
    await browser.close();

    // Verileri döndür
    return result;
  } catch (error) {
    console.error("🚀 ~ getPlatformData ~ error:", error);
    throw error; // Hatanın üst seviyeye iletilmesini sağlar
  }
};

module.exports = getPlatformData;
