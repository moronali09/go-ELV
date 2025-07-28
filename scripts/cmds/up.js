
const fs = require("fs");
const path = require("path");

const statusFile = path.join(__dirname, "..", "bot-status.json");

if (!process._statusHookRegistered) {
  process._statusHopokRegistered = true;

  const saveShutdownTime = () => {
    const data = { lastShutdown: Date.now() };
    try {
      fs.writeFileSync(statusFile, JSON.stringify(data));
    } catch (e) {
      console.error("❌ Could not save shutdown time:", e);
    }
    process.exit();
  };

  process.on("SIGINT", saveShutdownTime);
  process.on("SIGTERM", saveShutdownTime);
}

module.exports = {
  config: {
    name: "up",
    version: "1.8",
    author: "moron ali",
    countDown: 0,
    role: 0,
    shortDescription: "Uptime & last offline",
    longDescription: "Shows how long the bot is up & last time it was offline",
    category: "info",
    guide: { en: "Usage: /up" }
  },

  onStart: async function ({ message }) {
    const now = Date.now();
    let offlineText = "No previous shutdown info";

    try {
      if (fs.existsSync(statusFile)) {
        const { lastShutdown } = JSON.parse(fs.readFileSync(statusFile, "utf-8"));
        const diff = Math.floor((now - lastShutdown) / 1000);
        const d = Math.floor(diff / 86400);
        const h = Math.floor((diff % 86400) / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        offlineText = `Last offline: ${d}d ${h}h ${m}m ${s}s ago`;
      }
    } catch (_) {}

    const uptimeSec = Math.floor(process.uptime());
    const ud = Math.floor(uptimeSec / 86400);
    const uh = Math.floor((uptimeSec % 86400) / 3600);
    const um = Math.floor((uptimeSec % 3600) / 60);
    const us = uptimeSec % 60;

    const replyText = [
      "🔵 Uptime:moronali-bot",
      "________________________",
      `      Days: ${ud}`,
      `      Hours: ${uh}`,
      `      Minutes: ${um}`,
      `      Seconds: ${us}`,
      "________________________"
    ].join("\n");

    message.reply(replyText);
  }
};
