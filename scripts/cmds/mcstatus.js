const axios = require("axios");

module.exports.config = {
  name: "mcstatus",
  aliases: ["si"],
  version: "3.1.0",
  hasPermssion: 0,
  credits: "moronali",
  description: "Minecraft server info (Java & Bedrock).",
  usage: "<host[:port]>",
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "Usage:\n/mcstatus <server-ip[:port]>\nExample: /mcstatus play.example.com",
      threadID,
      messageID
    );
  }

  const [hostRaw, portRaw] = args[0].split(":");
  const host = hostRaw.trim();
  const port = (portRaw || "25565").trim();
  const isBedrock = port === "19132";
  const url = isBedrock
    ? `https://api.mcsrvstat.us/3/bedrock/${host}:${port}`
    : `https://api.mcsrvstat.us/3/${host}:${port}`;

  const tStart = Date.now();
  try {
    const res = await axios.get(url, { timeout: 10000 });
    const d = res.data || {};
    const ping = Date.now() - tStart;

    if (!d?.online) {
      return api.sendMessage(`🔴 OFFLINE: ${hostname}`, threadID, messageID);
    }

    // Basic identification
    const serverType = isBedrock ? "Bedrock" : "Java";
    const ip = d.ip || host;
    const hostname = d.hostname || host;
    const protocol = d.protocol ?? (d.version?.protocol ?? "Unknown");

    // MOTD
    let motd = "No MOTD";
    if (Array.isArray(d.motd?.clean)) motd = d.motd.clean.join(" ");
    else if (typeof d.motd?.clean === "string") motd = d.motd.clean;

    // Version & software
    const version = d.version?.name_clean || d.version?.raw || "Unknown";
    const software = d.software?.name || d.software?.raw || "Unknown";

    // Players
    const playersOnline = Number(d.players?.online || 0);
    const playersMax = Number(d.players?.max || 0);
    const playersInfo = `${playersOnline}/${playersMax}`;

    // Determine which sample/list provided
    const rawNames =
      Array.isArray(d.players?.list) ? d.players.list :
      Array.isArray(d.players?.sample) ? d.players.sample :
      [];

    const sampleSource = Array.isArray(d.players?.list) ? "list" :
                         Array.isArray(d.players?.sample) ? "sample" : "none";

    const namesArray = rawNames.map(item =>
      typeof item === "string" ? item : (item.name || item.player || JSON.stringify(item))
    );

    // Player list output logic (fix for your reported bug)
    let playerListText = "";
    if (namesArray.length > 0) {
      playerListText = namesArray.map((n, i) => `${i + 1}. ${n}`).join("\n");
    } else if (playersOnline > 0) {
      // players exist but API didn't return names
      playerListText = `Player list unavailable (server has query disabled or privacy). ${playersOnline} player(s) online.`;
    } else {
      playerListText = "No players online.";
    }

    // Extras: mods/plugins/map/icon/whitelist
    const extra = [];
    if (d.mods?.names && Array.isArray(d.mods.names) && d.mods.names.length) {
      extra.push(`Mods: ${d.mods.names.join(", ")}`);
    } else if (d.mods?.raw) {
      extra.push(`Mods: ${JSON.stringify(d.mods.raw)}`);
    }
    if (d.plugins?.names && d.plugins.names.length) extra.push(`Plugins: ${d.plugins.names.join(", ")}`);
    if (d.map) extra.push(`Map: ${d.map}`);
    if (typeof d.whitelist === "boolean") extra.push(`Whitelist: ${d.whitelist ? "enabled" : "disabled"}`);
    if (d.icon) {
      // d.icon is usually a data URI (base64). We won't auto-send the image, but note its presence.
      extra.push(`Icon: available`);
    }

    // Latency / probe details if present
    if (d.debug && typeof d.debug === "object") {
      if (d.debug.protocol) extra.push(`Protocol debug: ${d.debug.protocol}`);
    }

    // Compose message
    const header = `🟢 Server Online: ${hostname} — ${serverType}`;
    const infoLines = [
      `Ping: ${ping} ms`,
      `Version: ${version}`,
      `Software: ${software}`,
      `Protocol: ${protocol}`,
      `MOTD: ${motd}`,
      `Players: ${playersInfo} (sample: ${sampleSource})`,
      extra.length ? `Extra: ${extra.join(" | ")}` : null
    ].filter(Boolean).join("\n");

    const divider = "_______________________________";

    const msg = `${header}
${infoLines}
${divider}
${playerListText}`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (err) {
    console.error("mcstatus error:", err?.message || err);
    return api.sendMessage(
      `⚠️ Failed to fetch server info: ${host} \n check the IP/port and try again.`,
      threadID,
      messageID
    );
  }
};
