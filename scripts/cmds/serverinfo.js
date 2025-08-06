const axios = require("axios");

module.exports.config = {
  name: "serverinfo",
  aliases: ["si", "mcstatus"],
  version: "1.9.0",
  hasPermssion: 0,
  credits: "moronali",
  description: "Check Minecraft Java/Bedrock server status and player names",
  usage: "serverinfo <host[:port]>",
};

module.exports.onStart = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "Usage:\n/serverinfo play.example.com\n/serverinfo ip:port",
      threadID,
      messageID
    );
  }

  const [host, port = "25565"] = args[0].split(":");
  const isBedrock = port === "19132";
  const url = isBedrock
    ? `https://api.mcsrvstat.us/bedrock/3/${host}:${port}`
    : `https://api.mcsrvstat.us/3/${host}:${port}`;

  try {
    const res = await axios.get(url);
    const d = res.data;

    if (!d?.online) {
      return api.sendMessage("🔴 OFFLINE", threadID, messageID);
    }

    let version;
    if (typeof d.version === "string") version = d.version;
    else version = d.version?.name_clean || d.software?.name || "Unknown";

    const playersOnline = d.players?.online || 0;
    const playersMax = d.players?.max || 0;
    const playersInfo = `${playersOnline}/${playersMax}`;

    const rawNames = Array.isArray(d.players?.list)
      ? d.players.list
      : Array.isArray(d.players?.sample)
      ? d.players.sample
      : [];

    const namesArray = rawNames.map(item =>
      typeof item === "string"
        ? item
        : item.name || item.player || JSON.stringify(item)
    );

    let playerNames;
    if (namesArray.length) {
      const showLimit = 5;
      const shown = namesArray.slice(0, showLimit);
      const nameLines = shown.map((n, i) => `${i + 1}. ${n}`).join("\n");
      const remaining = namesArray.length - showLimit;
      const more = remaining > 0 ? `\n…and ${remaining} more` : "";
      playerNames = nameLines + more;
    } else {
      playerNames = "No players online or query disabled. Enable 'enable-query' in server.properties.";
    }

    const msg =
`minecraft server info/only info
    🟢 ONLINE
                             V: ${version}
Players: ${playersInfo}
_______________________________
${playerNames}`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (error) {
    console.error("mcstatus error:", error.message || error);
    return api.sendMessage(
      "🟠 ERROR\ncheck IP and try again.",
      threadID,
      messageID
    );
  }
};
