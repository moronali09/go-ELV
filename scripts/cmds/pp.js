const fs = global.nodemodule['fs-extra'];
const request = global.nodemodule['request'];

module.exports.config = {
  name: "pp",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "mornali",
  description: "📸 Fetch Facebook profile picture",
  commandCategory: "tools",
  cooldowns: 5,
  usages: "{pn} [id|mention|profileURL]"
};

module.exports.run = async function({ event, api, args, Users }) {
  try {
    let uid;

    // 1. Reply to a message
    if (event.type === 'message_reply') {
      uid = event.messageReply.senderID;
    }
    // 2. Mention
    else if (Object.keys(event.mentions).length) {
      uid = Object.keys(event.mentions)[0];
    }
    // 3. Profile URL
    else if (args[0] && args[0].includes('facebook.com/')) {
      uid = (await api.getUID(args[0]));
    }
    // 4. Direct ID
    else if (args[0]) {
      uid = args[0];
    }
    // 5. Default to sender
    else {
      uid = event.senderID;
    }

    // Fetch name (optional)
    const name = await Users.getNameUser(uid);
    const picUrl = `https://graph.facebook.com/${uid}/picture?width=1500&height=1500`;

    // Download image
    const pathImg = __dirname + `/cache/${uid}.jpg`;
    await new Promise((resolve, reject) => {
      request(
        encodeURI(picUrl)
      )
      .pipe(fs.createWriteStream(pathImg))
      .on('close', resolve)
      .on('error', reject);
    });

    // Send reply
    return api.sendMessage(
      {
        body: ` `, 
        attachment: fs.createReadStream(pathImg)
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage(`❌ Failed to fetch profile picture.`, event.threadID);
  }
};
