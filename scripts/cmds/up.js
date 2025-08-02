const axios = require("axios");

module.exports = {
  config: {
    name: "up",
    version: "1.1",
    author: "moron ali",
    countDown: 5,
    role: 0,
    shortDescription: "Show server uptime",
    longDescription: "Displays how long the server has been running since start",
    category: "system",
    guide: "{p}up"
  },

  onStart: async function ({ api, event }) {
    try {
      // Fetch server startTime from remote endpoint
      const res = await axios.get("https://a-6ntn.onrender.com/uptime");
      // Expecting JSON: { startTime: "2025-07-01T12:00:00Z" }
      const { startTime } = res.data;
      const startMs = new Date(startTime).getTime();
      const nowMs = Date.now();
      const diffSec = Math.floor((nowMs - startMs) / 1000);

      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      const msg = `🔵 Server Uptime: moronali-ELV\n` +
                  `________________________\n` +
                  `│ Days    : ${days}\n` +
                  `│ Hours   : ${hours}\n` +
                  `│ Minutes : ${minutes}\n` +
                  `│ Seconds : ${seconds}\n` +
                  `________________________`;

      return api.sendMessage(msg, event.threadID, event.messageID);
    } catch (e) {
      console.error(e);
      return api.sendMessage(
        `❌ Unable to fetch uptime: ${e.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
