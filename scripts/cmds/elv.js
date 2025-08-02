const axios = require("axios");
const streamifier = require("streamifier");

module.exports = {
  config: {
    name: "elv",
    version: "2.1",
    author: "moron ali",
    description: { en: "Bengali text to voice (in-memory)" },
    guide: { en: "{pn} <Bangla text>" },
    category: "ai"
  },

  onStart: async function ({ api, event, args }) {
    const text = args.join(" ");
    if (!text) return api.sendMessage("text deo", event.threadID, event.messageID);

    const apiKey = "sk_56968eeeb8eee6ec57cf862a61f9c51e11f2b7b2a87dbd9f"; 
    const voiceId = "pNInz6obpgDQGcFmaJgB";

    try {

      const resp = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.4, similarity_boost: 0.8 }
        },
        {
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json"
          },
          responseType: "arraybuffer"
        }
      );

      const audioBuffer = Buffer.from(resp.data);

      const readStream = streamifier.createReadStream(audioBuffer);

      api.sendMessage(
        {
          body: `✅ Voice ready for:\n"${text}"`,
          attachment: readStream
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error("TTS Error:", e.response?.status, e.response?.data || e.message);
      api.sendMessage("❌ voice error", event.threadID, event.messageID);
    }
  }
};
