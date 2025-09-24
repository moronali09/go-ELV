const fs = require("fs");
let startTime = Date.now();
let customOffset = { days: 0, hours: 0, minutes: 0, seconds: 0 };

module.exports = {
  config: {
    name: "up",
    aliases: ["uptime"],
    version: "1.0",
    author: "moronali",
    countDown: 5,
    role: 0,
    shortDescription: "Show bot uptime",
    longDescription: "Check how long the bot has been running",
    category: "utility",
    guide: {
      en: "{pn} | {pn} set <days> <minutes> <seconds>"
    }
  },

  onStart: async function ({ message, args }) {
    if (args[0] === "set") {
      let d = parseInt(args[1] || 0);
      let m = parseInt(args[2] || 0);
      let s = parseInt(args[3] || 0);

      customOffset.days = d;
      customOffset.minutes = m;
      customOffset.seconds = s;
      customOffset.hours = 0;

      startTime = Date.now();

      return message.reply(`✅ Uptime set from: ${d}d ${m}m ${s}s`);
    }

    let now = Date.now();
    let diff = Math.floor((now - startTime) / 1000);

    let totalSeconds =
      customOffset.seconds +
      diff +
      customOffset.minutes * 60 +
      customOffset.hours * 3600 +
      customOffset.days * 86400;

    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    const msg = `🔵 Server Uptime: moronali-ELV
________________________
│ Days    : ${days}
│ Hours   : ${hours}
│ Minutes : ${minutes}
│ Seconds : ${seconds}
________________________`;

    return message.reply(msg);
  }
};
