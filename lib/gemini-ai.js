/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function generateWithAI(user) {
  const chatSession = model.startChat({
    generationConfig,
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [],
  });

  const result = await chatSession.sendMessage(
    `"Verilen kullanıcı adı, kullanıcı listesi içerisinde varsa verilen kullanıcıya verilen kullanıcı adına benzer, kullanıcı listesinde olmayacak şekilde isimler belirle -noktalama işareti kullanmak istersen sadece alt tire, tire ve nokta kullanabilirsin. Biraz yaratıcı ve mantıklı olsun- ve 3 tanesine karar ver. Sonrasında sadece JSON formatında, herhangi bir ek etiket veya açıklama olmadan, bir dizi olarak döndür. Örnek: [{"username": "yeni_kullanici_adi"}, {"username": "farkli_kullanici_adi"}, {"username": "farkli_kullanici_adi"}]. ${
      user.username
    }. Kullanıcı listesi: ${user.userList.map((u) => u.username).join(", ")}`
  );

  const aiResponse = await result.response.text();

  const cleanedResponse = aiResponse.replace(/`.+?`/g, "");

  const parsedResponse = JSON.parse(cleanedResponse);

  const desiredFormat = {
    suggestion: parsedResponse,
  };

  return desiredFormat;
}

module.exports = generateWithAI;
