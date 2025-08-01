module.exports.config = {
  name: "uptime",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "moron ali",
  description: "Show bot uptime",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const time = process.uptime();
  const days = Math.floor(time / (60 * 60 * 24));
  const hours = Math.floor((time % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((time % (60 * 60)) / 60);
  const seconds = Math.floor(time % 60);

  const msg = `🔵 Uptime: moronali-bot
________________________
│ Days    : ${days}
│ Hours   : ${hours}
│ Minutes : ${minutes}
│ Seconds : ${seconds}
________________________`;

  api.sendMessage(msg, event.threadID, event.messageID);
};
