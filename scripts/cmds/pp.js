const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pp",
    version: "1.0",
    author: "moron ali",
    countDown: 5,
    role: 0,
    shortDescription: "Profile picture",
    longDescription: "Fetch profile picture of a user",
    category: "media",
    guide: "{p}pp (mention/reply/nothing)"
  },

  onStart: async function ({ message, event, usersData }) {
    const targetID = event.type === "message_reply"
      ? event.messageReply.senderID
      : (event.mentions && Object.keys(event.mentions)[0]) || event.senderID;

    const url = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    // Make sure cache folder exists
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `${targetID}.jpg`);
    const img = (await axios.get(url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(filePath, Buffer.from(img, "utf-8"));

    const name = await usersData.getName(targetID);
    message.reply({ body: ` `, attachment: fs.createReadStream(filePath) }, () => {
      fs.unlinkSync(filePath);
    });
  }
};
