module.exports = {
  config: {
    name: "up",
    version: "1.0",
    author: "moron ali",
    countDown: 5,
    role: 0,
    shortDescription: "Show bot uptime",
    longDescription: "Displays how long the bot has been running",
    category: "system",
    guide: "{p}up"
  },

  onStart: async function ({ message }) {
    const time = process.uptime(); // seconds
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

    message.reply(msg);
  }
};
