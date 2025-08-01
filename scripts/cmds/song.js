const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ytsr = require("ytsr");
const axios = require("axios");

// FFmpeg path set
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports.config = {
  name: "song",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "moron ali",
  description: "🎵 Search song & download as MP3",
  commandCategory: "music",
  usages: "song <song name or YouTube URL>",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ");
  if (!query) return api.sendMessage("❌ | Please provide a song name or URL.", event.threadID, event.messageID);

  let videoUrl;
  let title, thumb;

  try {
    if (ytdl.validateURL(query)) {
      const info = await ytdl.getInfo(query);
      videoUrl = query;
      title = info.videoDetails.title;
      thumb = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
    } else {
      const filters = await ytsr.getFilters(query);
      const videoFilter = filters.get("Type").get("Video");
      const searchResults = await ytsr(videoFilter.url, { limit: 5 });
      const chosen = searchResults.items.find(v => v.type === "video");
      if (!chosen) return api.sendMessage("❌ | No song found!", event.threadID, event.messageID);
      videoUrl = chosen.url;
      title = chosen.title;
      thumb = chosen.bestThumbnail.url;
    }

    // Send thumbnail and title first
    const imgPath = `${__dirname}/cache/preview.jpg`;
    const thumbRes = await axios.get(thumb, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(thumbRes.data, "binary"));
    api.sendMessage(
      {
        body: `✅ | Found: ${title}`,
        attachment: fs.createReadStream(imgPath),
      },
      event.threadID,
      () => fs.unlinkSync(imgPath)
    );

    // Download and convert to mp3
    const stream = ytdl(videoUrl, { quality: "highestaudio" });
    const fileName = `${__dirname}/cache/${Date.now()}.mp3`;

    ffmpeg(stream)
      .audioBitrate(128)
      .format("mp3")
      .save(fileName)
      .on("end", () => {
        api.sendMessage(
          {
            body: `${title}`,
            attachment: fs.createReadStream(fileName),
          },
          event.threadID,
          () => fs.unlinkSync(fileName)
        );
      })
      .on("error", err => {
        console.log(err);
        api.sendMessage("❌ | Failed to convert the song.", event.threadID, event.messageID);
      });
  } catch (err) {
    console.log(err);
    api.sendMessage("❌ | Something went wrong!", event.threadID, event.messageID);
  }
};
        
