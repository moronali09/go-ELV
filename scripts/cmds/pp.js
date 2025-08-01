const fs = global.nodemodule['fs'] || require('fs');
const request = global.nodemodule['request'] || require('request');
const axios = global.nodemodule['axios'] || require('axios');
const path = require('path');

module.exports.config = {
  name: "pp",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "moronali",
  description: "📸 Fetch Facebook profile picture",
  commandCategory: "tools",
  cooldowns: 5,
  usages: "{pn} [id|mention|profileURL]"
};

module.exports.onStart = async function({ event, api, args, Users }) {
  try {
    let uid;

    if (event.type === 'message_reply' && event.messageReply) {
      uid = event.messageReply.senderID;
    }

    else if (event.mentions && Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    }

    else if (args[0] && args[0].includes('facebook.com/')) {
      uid = await api.getUID(args[0]);
    }

    else if (args[0]) {
      uid = args[0];
    }

    else {
      uid = event.senderID;
    }


    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);


    const accessToken = '6628568379|c1e620fa708a1d5696fb991c1bde5662';
    const picUrl = `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=${accessToken}`;
    const imagePath = path.join(cacheDir, 'pp.png');


    await new Promise((resolve, reject) => {
      request(encodeURI(picUrl))
        .pipe(fs.createWriteStream(imagePath))
        .on('close', resolve)
        .on('error', reject);
    });


    let name;
    try {
      name = await Users.getNameUser(uid);
    } catch {
      name = uid;
    }


    await api.sendMessage(
      { body: `  -==Profile==`, attachment: fs.createReadStream(imagePath) },
      event.threadID,
      () => fs.unlinkSync(imagePath),
      event.messageID
    );

  } catch (err) {
    console.error('PP Error:', err);
    return api.sendMessage(`❌ Lỗi: ${err.message}`, event.threadID, event.messageID);
  }
};
             
