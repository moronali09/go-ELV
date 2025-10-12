const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
config: {
name: "edit",
version: "2.0",
author: "moronali",
countDown: 5,
role: 0,
shortDescription: { en: "edit image... prompt" },
longDescription: { en: "edit an uploaded image based on your prompt." },
category: "image",
guide: { en: "{p}edit [prompt] (reply to image)" }
},

onStart: async function ({ api, event, args, message }) {
const prompt = args.join(" ");
const repliedImage = event.messageReply?.attachments?.[0];

if (!prompt || !repliedImage || repliedImage.type !== "photo") {
return message.reply("prompt de leura");
}

const imgPath = path.join(__dirname, "cache", `${Date.now()}_edit.jpg`);
const waitMsg = await message.reply(`wait leura `);

try {
const imgURL = repliedImage.url;
const imageUrl = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imgURL)}`;
const res = await axios.get(imageUrl, { responseType: "arraybuffer" });

await fs.ensureDir(path.dirname(imgPath));
await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

await message.reply({
attachment: fs.createReadStream(imgPath)
});

} catch (err) {
console.error("Error:", err);
message.reply("Failed Please try again later, leura.");
} finally {
await fs.remove(imgPath);
api.unsendMessage(waitMsg.messageID);
}
}
};
