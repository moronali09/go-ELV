const axios = require("axios");
const streamifier = require("streamifier");

async function getBaseApiUrl() {
  const res = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return res.data.api;
}

async function downloadBuffer(url) {
  const resp = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(resp.data);
}

module.exports.config = {
  name: "song",
  version: "1.0",
  aliases: ["play", "music"],
  credits: "moron ali",
  hasPermssion: 0,
  description: "Search and send first YouTube song result (title, thumbnail, mp3)",
  commandCategory: "media",
  guide: { en: "{pn} <song name>" }
};

// Entry point expected by the framework
module.exports.onStart = async function({ api, event, args }) {
  const keyword = args.join(" ").trim();
  if (!keyword) {
    return api.sendMessage("Use: /songsearch <song name>", event.threadID, event.messageID);
  }

  try {
    const BASE = await getBaseApiUrl();
    // Search and pick first result
    const searchRes = await axios.get(`${BASE}/ytFullSearch?songName=${encodeURIComponent(keyword)}`);
    const results = searchRes.data;
    if (!results.length) {
      return api.sendMessage(`⭕ No matches for \"${keyword}\"`, event.threadID, event.messageID);
    }
    const first = results[0];

    // Send title + thumbnail
    const thumbResp = await axios.get(first.thumbnail, { responseType: "stream" });
    api.sendMessage(
      { body: `🎵 ${first.title}`, attachment: thumbResp.data },
      event.threadID,
      async () => {
        // Download mp3 and send
        const dlRes = await axios.get(`${BASE}/ytDl3?link=${first.id}&format=mp3`);
        const { title, downloadLink } = dlRes.data;
        const audioBuffer = await downloadBuffer(downloadLink);
        const audioStream = streamifier.createReadStream(audioBuffer);
        api.sendMessage(
          { body: `▶️ Now playing: ${title}`, attachment: audioStream },
          event.threadID,
          event.messageID
        );
      },
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};
