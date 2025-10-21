const axios = require("axios");

module.exports = {
  config: {
    name: "mcstatus",
    aliases: ["si"],
    version: "3.1.0",
    author: "moronali",
    countDown: 10,
    role: 0,
    shortDescription: "Minecraft server info (Java & Bedrock)",
    longDescription: "Check status of Minecraft Java or Bedrock server.",
    category: "tools",
    guide: {
      en: "{pn} <host[:port]>",
      vi: "{pn} <host[:port]>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return api.sendMessage(
        "/si donutsmp.net. Leura",
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
        return api.sendMessage(`🔴 OFFLINE`, threadID, messageID);
      }

      const serverType = isBedrock ? "Bedrock" : "Java";
      const hostname = d.hostname || host;
      const protocol = d.protocol ?? (d.version?.protocol ?? "Unknown");

      let motd = "No MOTD";
      if (Array.isArray(d.motd?.clean)) motd = d.motd.clean.join(" ");
      else if (typeof d.motd?.clean === "string") motd = d.motd.clean;

      const version = d.version?.name_clean || d.version?.raw || "Unknown";
      const software = d.software?.name || d.software?.raw || "Unknown";

      const playersOnline = Number(d.players?.online || 0);
      const playersMax = Number(d.players?.max || 0);
      const playersInfo = `${playersOnline}/${playersMax}`;

      const rawNames =
        Array.isArray(d.players?.list) ? d.players.list :
        Array.isArray(d.players?.sample) ? d.players.sample :
        [];

      const namesArray = rawNames.map(item =>
        typeof item === "string" ? item : (item.name || item.player || JSON.stringify(item))
      );

      let playerListText = "";
      if (namesArray.length > 0) {
        playerListText = namesArray.map((n, i) => `${i + 1}. ${n}`).join("\n");
      } else if (playersOnline > 0) {
        playerListText = `${playersOnline} player(s) online.`;
      } else {
        playerListText = "No players online.";
      }

      const extra = [];
      if (d.mods?.names?.length) extra.push(`Mods: ${d.mods.names.join(", ")}`);
      if (d.plugins?.names?.length) extra.push(`Plugins: ${d.plugins.names.join(", ")}`);
      if (d.map) extra.push(`Map: ${d.map}`);
      if (typeof d.whitelist === "boolean") extra.push(`Whitelist: ${d.whitelist ? "enabled" : "disabled"}`);
    

      const header = `🟢 ╭──Server is Online──`;
      const infoLines = [
        `                                 ping   : ${ping}ms`,
        `                                 player: ${playersInfo}`,
        
        extra.length ? `Extra: ${extra.join(" | ")}` : null
      ].filter(Boolean).join("\n");

      const msg = `${header}\n${infoLines}\n─────────────────\n${playerListText}`;

      return api.sendMessage(msg, threadID, messageID);
    } catch (err) {
      console.error("mcstatus error:", err?.message || err);
      return api.sendMessage(
        `${host} \ntry again, Leura.`,
        threadID,
        messageID
      );
    }
  }
};
