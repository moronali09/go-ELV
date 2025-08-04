const axios = require('axios');
const dns = require('dns').promises;

// Simple per-user cache to avoid rate-limits
const CACHE = {};
const CACHE_TTL = 15 * 1000; // 15 seconds

module.exports.config = {
  name: "mcserverinfo",
  aliases: ["si"],
  version: "1.2.0",
  hasPermssion: 0,
  credits: "mornali",
  description: "God-level Minecraft Server Info (Java & Bedrock) with embed",
  usage: "serverinfo <host[:port]>",
};

module.exports.onStart = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const input = args[0];

  if (!input) {
    return api.sendMessage(
      "❓ Usage: serverinfo play.example.com[:25565 or :19132]",
      threadID, messageID
    );
  }

  // Show typing
  api.sendTypingIndicator(threadID);

  // Resolve SRV record if present
  let host = input;
  let port = 25565;
  try {
    const srv = await dns.resolveSrv(`_minecraft._tcp.${input}`);
    if (srv.length) {
      host = srv[0].name;
      port = srv[0].port;
    } else if (input.includes(":")) {
      [host, port] = input.split(":");
      port = parseInt(port, 10);
    }
  } catch {
    if (input.includes(":")) {
      [host, port] = input.split(":");
      port = parseInt(port, 10);
    }
  }

  const cacheKey = `${event.senderID}:${host}:${port}`;
  const now = Date.now();
  if (CACHE[cacheKey] && (now - CACHE[cacheKey].ts) < CACHE_TTL) {
    return sendEmbed(CACHE[cacheKey].data);
  }

  // Detect Bedrock by default port
  const isBedrock = port === 19132;
  const url = isBedrock
    ? `https://api.mcsrvstat.us/3/bedrock/${encodeURIComponent(host)}:${port}`
    : `https://api.mcsrvstat.us/3/${encodeURIComponent(host)}:${port}`;

  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "GoatBot/1.2" }
    });
    const data = res.data;
    CACHE[cacheKey] = { ts: now, data };
    return sendEmbed(data);
  } catch (error) {
    console.error("serverinfo error:", error);
    return api.sendMessage(
      "⚠️ Unable to fetch server info. Please check the host and try again.",
      threadID, messageID
    );
  }

  function sendEmbed(d) {
    const online = d.online === true;
    const embed = {
      embed: {
        title: `🎮 ${online ? "Online" : "Offline"} • ${host}:${port}`,
        color: online ? 0x00ff00 : 0xff0000,
        fields: [],
        footer: { text: "Data provided by api.mcsrvstat.us" },
        timestamp: new Date().toISOString()
      }
    };

    if (online) {
      embed.embed.fields.push(
        { name: "👥 Players", value: `${d.players.online}/${d.players.max}`, inline: true },
        { name: "🔢 Version", value: d.version?.name_clean || "Unknown", inline: true }
      );
      if (d.debug?.pingTime != null) {
        embed.embed.fields.push({
          name: "⚡ Ping",
          value: `${d.debug.pingTime} ms`,
          inline: true
        });
      }
      if (d.motd?.clean) {
        embed.embed.fields.push({
          name: "💬 MOTD",
          value: d.motd.clean.join("\n"),
          inline: false
        });
      }
      if (d.icon && d.icon.startsWith("data:image")) {
        embed.embed.thumbnail = { url: d.icon };
      }
    }

    return api.sendMessage(embed, threadID, messageID);
  }
};
