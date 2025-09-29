const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const TMP = path.join(os.tmpdir(), "goatbot_song");
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

// helpers to download thumbnail or file and return createReadStream
async function dipto(url, pathName) {
  try {
    const response = (await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000
    })).data;
    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
}

// if API supports stream URLs we can return stream object by streaming response
async function diptoStream(url, pathName) {
  try {
    const response = await axios.get(url, { responseType: "stream", timeout: 20000 });
    const out = fs.createWriteStream(pathName);
    response.data.pipe(out);
    return await new Promise((resolve, reject) => {
      out.on("finish", () => resolve(fs.createReadStream(pathName)));
      out.on("error", reject);
    });
  } catch (err) {
    throw err;
  }
}

// try to extract YouTube video id from a link
function extractVideoID(url) {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  const m = url.match(checkurl);
  return m ? m[1] : null;
}

module.exports = {
  config: {
    name: "song",
    version: "1.1",
    author: "moronali",
    countDown: 5,
    role: 0,
    description: "Search and send thumbnail + video(mp4) or audio(mp3). Usage: song <query> OR song sing <query>",
    category: "media",
    guide: {
      en: "song <query> -> thumbnail + mp4\nsong sing <query> -> thumbnail + mp3"
    }
  },

  onStart: async function ({ api, args, event }) {
    try {
      if (!args || args.length === 0) return api.sendMessage("Usage: song <query>  OR  song sing <query>", event.threadID, event.messageID);

      let mode = "video"; // video -> mp4, audio -> mp3
      let qParts = args.slice();
      if (args[0].toLowerCase() === "sing") {
        mode = "audio";
        qParts = args.slice(1);
        if (qParts.length === 0) return api.sendMessage("Usage: song sing <song name>", event.threadID, event.messageID);
      }

      const query = qParts.join(" ").trim();
      if (!query) return api.sendMessage("Please provide a search query or YouTube link.", event.threadID, event.messageID);

      let videoID = null;
      let selected = null;

      // if query is a link, try extract id
      const possibleId = extractVideoID(query);
      if (possibleId) {
        videoID = possibleId;
        // try to get some info from API
        try {
          const infoRes = await axios.get(`${await baseApiUrl()}/ytfullinfo?videoID=${videoID}`);
          selected = infoRes.data || null;
        } catch (e) {
          selected = { id: videoID, title: "Unknown Title", thumbnail: null, time: null, channel: { name: '' } };
        }
      } else {
        // search via API and pick first result
        const maxResults = 6;
        const searchRes = await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(query)}`);
        const results = (searchRes.data || []).slice(0, maxResults);
        if (!results || results.length === 0) {
          return api.sendMessage("⭕ No results found for: " + query, event.threadID, event.messageID);
        }
        selected = results[0]; 
        videoID = selected.id;
      }

      if (selected && (selected.thumbnail || selected.thumbnails || selected.bestThumbnail)) {
        const thumbUrl = selected.thumbnail || (selected.thumbnails && selected.thumbnails[0]) || (selected.bestThumbnail && selected.bestThumbnail.url) || null;
        if (thumbUrl) {
          try {
            const thumbPath = path.join(TMP, `thumb_${Date.now()}.jpg`);
            const thumbStream = await dipto(thumbUrl, thumbPath);
            await api.sendMessage({ body: attachment: thumbStream }, event.threadID);
            try { fs.unlinkSync(thumbPath); } catch (e) {}
          } catch (e) {

            if (selected.thumbnail) await api.sendMessage("Thumbnail: " + selected.thumbnail, event.threadID);
          }
        }
      }

      const format = mode === "audio" ? "mp3" : "mp4";
      await api.sendMessage(`${selected.title || videoID}`, event.threadID);

      const dlRes = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=4`);
      const { data } = dlRes;
      if (!data || !data.downloadLink) {
        return api.sendMessage("❌ | link not available from API.", event.threadID, event.messageID);
      }

      const ext = format;
      const outPath = path.join(TMP, `song_${Date.now()}.${ext}`);

      try {
        const stream = await diptoStream(data.downloadLink, outPath);

        const bodyText = ` || selected.title || 'Unknown'}\n ${data.quality || 'auto'}`;
        await api.sendMessage({ body: bodyText, attachment: stream }, event.threadID, () => {
          try { fs.unlinkSync(outPath); } catch (e) {}
        }, event.messageID);
      } catch (err) {
        console.error("Download/send error:", err);
        return api.sendMessage("❌ | Failed", event.threadID, event.messageID);
      }

    } catch (err) {
      console.error("song command error:", err);
      return api.sendMessage("❌ | request error  .", event.threadID, event.messageID);
    }
  }
};
