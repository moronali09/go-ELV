const axios = require("axios");

module.exports.config = {
  name: "mcstatus",
  aliases: ["si"],
  version: "3.0.0",
  hasPermssion: 0,
  credits: "moronali",
  description: "Minecraft server info (Java & Bedrock)",
  usage: " <host[:port]>",
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "Usage:\n/mcstatus <server-ip[:port]>",
      threadID,
      messageID
    );
  }

  const [host, port = "25565"] = args[0].split(":");
  const isBedrock = port === "19132";
  const url = isBedrock
    ? `https://api.mcsrvstat.us/3/bedrock/${host}:${port}`
    : `https://api.mcsrvstat.us/3/${host}:${port}`;

  const tStart = Date.now();
  try {
    const res = await axios.get(url);
    const d = res.data;
    const ping = Date.now() - tStart;

    if (!d?.online) {
      return api.sendMessage(`🔴OFFLINE`, threadID, messageID);
    }

    // Version & Software
    let version = d.version?.name_clean || d.software?.name || "Unknown";
    let software = d.software?.name ? d.software.name : "Unknown";

    // MOTD
    const motd = Array.isArray(d.motd?.clean)
      ? d.motd.clean.join(" ")
      : d.motd?.clean || "No MOTD";

    // Players
    const playersOnline = d.players?.online || 0;
    const playersMax = d.players?.max || 0;
    const playersInfo = `${playersOnline}/${playersMax}`;

    const rawNames = Array.isArray(d.players?.list)
      ? d.players.list
      : Array.isArray(d.players?.sample)
      ? d.players.sample
      : [];

    const namesArray = rawNames.map(item =>
      typeof item === "string" ? item : item.name || item.player || JSON.stringify(item)
    );

    const playerNames = namesArray.length
      ? namesArray.map((n, i) => `${i + 1}. ${n}`).join("\n")
      : "No players online or query disabled";

    // Extra info if available
    const extraInfo = [];
    if (d.mods?.names) extraInfo.push(`Mods: ${d.mods.names.join(", ")}`);
    if (d.map) extraInfo.push(`Map: ${d.map}`);
    if (d.icon) extraInfo.push(`Icon available`);
    if (d.whitelist) extraInfo.push(`Whitelist: enabled`);

    const serverType = isBedrock ? "Bedrock" : "Java";

    const msg = `🟢ONLINE: ${host} (${serverType})
Ping: ${ping} ms
Version: ${version} | Software: ${software}
MOTD: ${motd}
Players: ${playersInfo}
${extraInfo.length ? extraInfo.join(" | ") : ""}
_______________________________
${playerNames}`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (error) {
    console.error("mcstatus error:", error.message || error);
    return api.sendMessage(
      `⚠️ Failed to fetch server info: ${host}:${port}\ncheck IP/port and try again.`,
      threadID,
      messageID
    );
  }
};
