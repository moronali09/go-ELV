const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "elv",
    version: "2.0",
    author: "moron ali",
    countDown: 3,
    role: 0,
    description: {
      en: "Convert Bengali text to deep voice using ElevenLabs"
    },
    category: "ai",
    guide: {
      en: "{pn} <Bangla text>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const text = args.join(" ");
    if (!text) return api.sendMessage("text deo", event.threadID, event.messageID);

    const apiKey = "sk_b1a26426ac437223d0d68c1cbd58ec3537c0c7d0de56ec45";
    const voiceId = "pNInz6obpgDQGcFmaJgB";

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    try {
      const response = await axios({
        method: "POST",
        url,
        responseType: "stream",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        data: {
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8
          }
        }
      });

      const filePath = path.join(__dirname, "bangla_voice.mp3");
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `✅ Voice ready for:\n"${text}"`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on("error", err => {
        console.error("Write error:", err);
        api.sendMessage("❌ save error", event.threadID, event.messageID);
      });

    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      api.sendMessage("❌ voice error", event.threadID, event.messageID);
    }
  }
};
