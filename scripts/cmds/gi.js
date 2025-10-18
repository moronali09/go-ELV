const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json");
  return base.data.api;
};

async function getAvatarUrls(userIDs) {
  const defaults = [
    "https://i.ibb.co/qk0bnY8/363492156-824459359287620-3125820102191295474-n-png-nc-cat-1-ccb-1-7-nc-sid-5f2048-nc-eui2-Ae-HIhi-I.png",
    "https://i.ibb.co/6tVQm1R/default1.png",
    "https://i.ibb.co/7QpKsCX/default2.png",
    "https://i.ibb.co/8xYb9mN/default3.png"
  ];
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
  const avatarURLs = [];
  for (let userID of userIDs) {
    try {
      const res = await axios.get(`https://graph.facebook.com/${userID}/picture`, {
        params: { height: 1500, width: 1500, redirect: false, access_token: decodeURIComponent(token) }
      });
      const url = res.data && res.data.data && res.data.data.url ? res.data.data.url : defaults[Math.floor(Math.random() * defaults.length)];
      avatarURLs.push(url);
    } catch (err) {
      avatarURLs.push(defaults[Math.floor(Math.random() * defaults.length)]);
    }
  }
  return avatarURLs;
}

module.exports = {
  config: {
    name: "gi",
    aliases: [],
    version: "2.0",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    description: "Generate a styled group image with square profile pictures",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ api, args, event, message }) {
    try {
      let textColor = "white";
      let bgColor = null;
      let adminColor = "yellow";
      let memberColor = "cyan";
      let borderColor = "lime";
      let glow = false;

      for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
          case "--color":
            textColor = args[i + 1];
            i++;
            break;
          case "--bgcolor":
            bgColor = args[i + 1];
            i++;
            break;
          case "--admincolor":
            adminColor = args[i + 1];
            i++;
            break;
          case "--membercolor":
            memberColor = args[i + 1];
            i++;
            break;
          case "--groupBorder":
            borderColor = args[i + 1];
            i++;
            break;
          case "--glow":
            glow = args[i + 1]?.toLowerCase() === "true";
            i++;
            break;
        }
      }

      const threadInfo = await api.getThreadInfo(event.threadID);
      const participantIDs = threadInfo.participantIDs || [];
      const adminIDs = (threadInfo.adminIDs || []).map(a => a.id);

      const memberAvatars = await getAvatarUrls(participantIDs);
      const adminAvatars = await getAvatarUrls(adminIDs);

      const defaultGroupPhotos = [
        "https://picsum.photos/1200/800?random=1",
        "https://picsum.photos/1200/800?random=2",
        "https://picsum.photos/1200/800?random=3",
        "https://picsum.photos/1200/800?random=4"
      ];
      const groupPhotoURL = defaultGroupPhotos[Math.floor(Math.random() * defaultGroupPhotos.length)];

      const payload = {
        groupName: threadInfo.threadName || "",
        groupPhotoURL,
        memberURLs: memberAvatars,
        adminURLs: adminAvatars,
        color: textColor,
        bgcolor: bgColor,
        admincolor: adminColor,
        membercolor: memberColor,
        groupborderColor: borderColor,
        glow,
        shape: "square"
      };

      const response = await axios.post(`${await baseApiUrl()}/gcimg`, payload, { responseType: "stream" });

      return message.reply({
        body: "",
        attachment: response.data
      });
    } catch (err) {
      console.error("[group img] Error:", err);
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch (e) {}
      return;
    }
  }
};
