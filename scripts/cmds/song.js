const fs = global.nodemodule['fs-extra'];
const ytdl = global.nodemodule['ytdl-core'];
const ffmpeg = global.nodemodule['fluent-ffmpeg'];
const ffmpegPath = global.nodemodule['ffmpeg-static'];
const ytsr = global.nodemodule['ytsr'];

// Set ffmpeg binary path
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports.config = {
  name: "song",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "moronali",
  description: "🎵 Search YouTube (or use URL) and send MP3",
  commandCategory: "tools",
  cooldowns: 5,
  usages: "{pn} <search term or YouTube URL>"
};

module.exports.run = async function({ event, api, args }) {
  if (!args.length) {
    return api.sendMessage('❗ Please provide a search term or YouTube link.', event.threadID, event.messageID);
  }

  const query = args.join(' ');
  let videoUrl, title, thumbUrl;

  try {
    if (ytdl.validateURL(query)) {
      videoUrl = query;
      const info = await ytdl.getInfo(videoUrl);
      title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, '').slice(0, 50);
      thumbUrl = info.videoDetails.thumbnail.thumbnails.pop().url;
    } else {
      // Search YouTube
      const filters = await ytsr.getFilters(query);
      const videoFilter = filters.get('Type').get('Video');
      const searchResults = await ytsr(videoFilter.url, { limit: 5 });
      const official = searchResults.items.find(i => i.type === 'video' && /official/i.test(i.title));
      const chosen = official || searchResults.items.find(i => i.type === 'video');
      if (!chosen) {
        return api.sendMessage('🔍 No video results found.', event.threadID, event.messageID);
      }
      videoUrl = chosen.url;
      title = chosen.title.replace(/[\\/:*?"<>|]/g, '').slice(0, 50);
      thumbUrl = chosen.bestThumbnail.url;
      // send thumbnail and title
      await api.sendMessage({
        body: `🔍 Selected: ${chosen.title}`,
        attachment: await global.utils.getStream(thumbUrl)
      }, event.threadID);
    }

    // Prepare file names
    const timestamp = Date.now();
    const cacheDir = __dirname + '/cache';
    await fs.ensureDir(cacheDir);
    const tempPath = `${cacheDir}/${timestamp}_${title}.mp4`;
    const outputPath = `${cacheDir}/${timestamp}_${title}.mp3`;

    // Download audio
    const audioStream = ytdl(videoUrl, { quality: 'highestaudio' });
    const writeStream = fs.createWriteStream(tempPath);
    audioStream.pipe(writeStream);

    writeStream.on('finish', () => {
      // Convert to MP3
      ffmpeg(tempPath)
        .audioBitrate(128)
        .format('mp3')
        .save(outputPath)
        .on('end', async () => {
          // Send MP3
          await api.sendMessage({
            body: `🎶 Here is your song: ${title}.mp3`,
            attachment: fs.createReadStream(outputPath)
          }, event.threadID, async () => {
            // Cleanup
            await fs.remove(tempPath);
            await fs.remove(outputPath);
          });
        })
        .on('error', err => {
          console.error(err);
          api.sendMessage('❌ Error converting to MP3.', event.threadID, event.messageID);
        });
    });

    writeStream.on('error', err => {
      console.error(err);
      api.sendMessage('❌ Error downloading audio.', event.threadID, event.messageID);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    api.sendMessage('❌ Something went wrong. Please try again later.', event.threadID, event.messageID);
  }
};
