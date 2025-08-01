const https = require("https");

// Environment Variables
const BIN_ID = process.env.JSONBIN_BIN_ID;          // jsonbin.io Bin ID
const SECRET_KEY = process.env.JSONBIN_SECRET_KEY;  // jsonbin.io Secret Key
const API_HOST = "api.jsonbin.io";

// Register shutdown hook once
if (!process._statusHookRegistered) {
  process._statusHookRegistered = true;
  const saveShutdownTime = () => {
    const payload = JSON.stringify({ lastShutdown: Date.now() });
    const opts = {
      hostname: API_HOST,
      path: `/v3/b/${BIN_ID}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": SECRET_KEY,
        "Content-Length": Buffer.byteLength(payload)
      }
    };
    const req = https.request(opts, res => {
      res.on("data", () => {});
      res.on("end", () => process.exit());
    });
    req.on("error", err => {
      console.error("❌ JSONBin Update Error:", err);
      process.exit();
    });
    req.write(payload);
    req.end();
  };

  process.on("SIGINT", saveShutdownTime);
  process.on("SIGTERM", saveShutdownTime);
}

module.exports = {
  config: {
    name: "up",
    version: "1.0",
    author: "moron ali",
    shortDescription: "Uptime & last offline",
    longDescription: "Shows bot uptime and last shutdown time via JSONBin",
    category: "info",
    guide: { en: "Usage: /up" }
  },

  onStart: async function({ message }) {
    // Fetch last shutdown time
    const getOpts = {
      hostname: API_HOST,
      path: `/v3/b/${BIN_ID}/latest`,
      method: "GET",
      headers: { "X-Master-Key": SECRET_KEY }
    };

    https.get(getOpts, res => {
      let raw = "";
      res.on("data", chunk => raw += chunk);
      res.on("end", () => {
        let offlineText = "No previous shutdown info";
        try {
          const json = JSON.parse(raw);
          const last = json.record.lastShutdown;
          if (last) {
            const diff = Math.floor((Date.now() - last) / 1000);
            const d = Math.floor(diff / 86400);
            const h = Math.floor((diff % 86400) / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            offlineText = `${d}d ${h}h ${m}m ${s}s ago`;
          }
        } catch (e) {
          console.error("❌ JSONBin Parse Error:", e);
        }

        // Calculate uptime
        const up = Math.floor(process.uptime());
        const ud = Math.floor(up / 86400);
        const uh = Math.floor((up % 86400) / 3600);
        const um = Math.floor((up % 3600) / 60);
        const us = up % 60;

        // Construct reply
        const replyText = [
          `🔵 Uptime: moronali-bot`,
          `________________________`,
          `${ud}d\n${uh}h\n${um}m`,
          `________________________`
        ].join("\n");

        message.reply(replyText);
      });
    }).on("error", err => {
      console.error("❌ JSONBin Fetch Error:", err);
      message.reply("Error fetching status.");
    });
  }
};
