const axios = require("axios");

module.exports = {
  config: {
    name: "i",
    version: "2.2",
    author: "moronali",
    countDown: 5,
    role: 0,
    longDescription: {
      vi: "",
      en: "Generate AI logo from text.",
    },
    category: "AI-IMAGE",
    guide: {
      vi: "",
      en: "Example: {pn} cute girl | 4 (will generate 4 images)",
    },
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      const text = args.join(" ");
      if (!text) {
        return message.reply("Please provide a prompt.");
      }

      let prompt, quantity;
      if (text.includes("|")) {
        [prompt, quantity] = text.split("|").map(str => str.trim());
        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity < 1 || quantity > 10) {
          return message.reply("Quantity must be a number between 1 and 10.");
        }
      } else {
        prompt = text;
        quantity = 4;
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, false);

      

      const imageUrls = [];

      const ratio = "1:1";

      for (let i = 0; i < quantity; i++) {
        const res = await axios.get(`https://www.ai4chat.co/api/image/generate`, {
          params: {
            prompt,
            aspect_ratio:ratio

          }
        });

        if (res.data?.image_link) {
          imageUrls.push(res.data.image_link);
        }
      }

      const imageStreams = await Promise.all(
        imageUrls.map(url => global.utils.getStreamFromURL(url))
      );

      await message.reply({ attachment: imageStreams });

      api.setMessageReaction("✅", event.messageID, () => {}, false);
      await api.unsendMessage(waitingMessage.messageID);
    } catch (error) {
      console.error("Image generation error:", error.message || error);
      
    }
  },
};
