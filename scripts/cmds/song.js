const axios = require("axios");
const fs = require('fs');

async function getBaseApi() {
  const { data } = await axios.get(
    'https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json'
  );
  return data.api;
}

module.exports.config = {
  name: "sing",
  aliases: ["song"],
  version: "2.1.0",
  credits: "dipto",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube",
  commandCategory: "media",
  usages: "{pn} <song name>|<song link>",
  guide: "Example: {pn} chipi chipi chapa chapa"
};

module.exports.run = async function({ api, args, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  if (!args.length) return api.sendMessage(
    `⚠️ Please provide a song name or YouTube link.\nUsage: ${this.config.usages}`,
    threadID, messageID
  );

  const ytLinkPattern = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})(?:\S+)?$/;
  let videoID;

  // Direct YouTube link
  if (ytLinkPattern.test(args[0])) {
    const match = args[0].match(ytLinkPattern);
    videoID = match[1];
    try {
      const base = await getBaseApi();
      const { data: { title, downloadLink } } = await axios.get(
        `${base}/ytDl3?link=${videoID}&format=mp3`
      );
      const attachment = await downloadToStream(downloadLink, 'audio.mp3');
      return api.sendMessage({ body: `🎵 ${title}`, attachment }, threadID, () => {
        fs.unlinkSync('audio.mp3');
      }, messageID);
    } catch (err) {
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }

  // Search by keyword
  const keyword = args.join(' ');
  try {
    const base = await getBaseApi();
    let results = (await axios.get(
      `${base}/ytFullSearch?songName=${encodeURIComponent(keyword)}`
    )).data;
    results = results.slice(0, 6);
    if (!results.length) {
      return api.sendMessage(
        `⭕ No results found for: ${keyword}`,
        threadID, messageID
      );
    }

    let msg = '🔍 Search Results:\n';
    const attachments = [];
    results.forEach((info, i) => {
      msg += `${i + 1}. ${info.title}\n⌚ ${info.time} | 📺 ${info.channel.name}\n\n`;
      attachments.push(streamToAttachment(info.thumbnail, `thumb_${i}.jpg`));
    });

    return api.sendMessage(
      { body: msg + '🔢 Reply with a number to choose.' , attachment: await Promise.all(attachments) },
      threadID,
      (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          results
        });
      },
      messageID
    );
  } catch (err) {
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};

module.exports.handleReply = async function({ event, api, handleReply }) {
  const { author, messageID, results } = handleReply;
  const threadID = event.threadID;
  const msgID = event.messageID;
  if (event.senderID !== author) return;
  const choice = parseInt(event.body);
  if (isNaN(choice) || choice < 1 || choice > results.length) {
    return api.sendMessage('❌ Invalid choice. Please enter a valid number.', threadID, msgID);
  }
  const selection = results[choice - 1];
  try {
    const base = await getBaseApi();
    const { data: { title, downloadLink, quality } } = await axios.get(
      `${base}/ytDl3?link=${selection.id}&format=mp3`
    );
    const attachment = await downloadToStream(downloadLink, 'audio.mp3');
    api.unsendMessage(messageID);
    return api.sendMessage(
      { body: `🎵 ${title}\n🎚️ Quality: ${quality}`, attachment },
      threadID,
      () => fs.unlinkSync('audio.mp3'),
      msgID
    );
  } catch (err) {
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, msgID);
  }
};

// Helpers
async function downloadToStream(url, filename) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filename, Buffer.from(res.data));
  return fs.createReadStream(filename);
}

async function streamToAttachment(url, filename) {
  const res = await axios.get(url, { responseType: 'stream' });
  res.data.path = filename;
  return res.data;
}
