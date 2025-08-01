const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "dog",
    aliases: ["puppy", "doggo"],
    version: "1.0",
    author: "mohan_moron",
    countDown: 2,
    role: 0,
    description: "Get a random dog image",
    category: "image",
    guide: {
      en: "{pn} — Send a random dog pic\nExample: dog"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // API থেকে র‍্যান্ডম ডগ ইমেজ URL নেয়া
      const res = await axios.get("https://dog.ceo/api/breeds/image/random");
      const imageUrl = res.data.message;
      // ইমেজ নাম ও পাথ
      const imgPath = path.join(__dirname, "dog.jpg");
      // ছবি ডাউনলোড
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, imgRes.data);
      // মেসেজ পাঠানো
      api.sendMessage(
        { body: "🐶 Here’s your random dog!", attachment: fs.createReadStream(imgPath) },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("🚫 Error fetching dog image.", event.threadID, event.messageID);
    }
  }
};
    
