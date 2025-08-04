const axios = require("axios");

module.exports.config = {
  name: "mcstatus",
  aliases: ["si"],
  version: "1.0.0",
  hasPermssion: 0,
  credits: "mornali",
  description: "Check Minecraft server status (Java & Bedrock)",
  usage: "mcstatus <host[:port]>",
  aliases: ["si"]
};

module.exports.onStart = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "📌 Usage:\n/mcstatus play.example.com\n/mcstatus ip:port",
      threadID,
      messageID
    );
  }

  const input = args[0];
  const parts = input.split(":");
  const host = parts[0];
  const port = parts[1] || "25565";

  const isBedrock = port === "19132";
  const url = isBedrock
    ? `https://api.mcsrvstat.us/3/bedrock/${host}:${port}`
    : `https://api.mcsrvstat.us/3/${host}:${port}`;

  try {
    const res = await axios.get(url);
    const d = res.data;

    if (!d || !d.online) {
      return api.sendMessage(
        `❌ Server is **offline** or unreachable.\nIP: ${host}:${port}`,
        threadID,
        messageID
      );
    }

    const motd = d.motd?.clean ? d.motd.clean.join("\n") : "No MOTD";
    const version = d.version?.name_clean || "Unknown";
    const players = d.players
      ? `${d.players.online}/${d.players.max}`
      : "N/A";

    const msg = 
`🎮 Minecraft Server Status

📡 IP: ${host}:${port}
✅ Online: Yes
👥 Players: ${players}
🔢 Version: ${version}
💬 MOTD:
${motd}`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (e) {
    console.log("mcstatus error:", e.message || e);
    return api.sendMessage(
      "⚠️ Error fetching server info. Please check the IP and try again.",
      threadID,
      messageID
    );
  }
};
