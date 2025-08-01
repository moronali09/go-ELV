// commands/up.js
module.exports.config = {
  name: "up",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "nexo_here",
  description: "Show bot uptime in detailed format",
  commandCategory: "system",
  cooldowns: 5,
  usages: "{pn}"
};

module.exports.run = async function({ api, event }) {
  // Calculate uptime
  const uptimeSec = Math.floor(process.uptime());
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = uptimeSec % 60;

  // Bot name
  const botName = api.getCurrentUserID ? (await api.getCurrentUserID()) : "moronali-bot";

  // Build message
  let msg = `🔵 Uptime: ${botName}\n`;
  msg += `________________________\n`;
  msg += `      Days: ${days}\n`;
  msg += `      Hours: ${hours}\n`;
  msg += `      Minutes: ${minutes}\n`;
  msg += `      Seconds: ${seconds}\n`;
  msg += `________________________`;

  // Send reply
  return api.sendMessage(msg, event.threadID, event.messageID);
};
