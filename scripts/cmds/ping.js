module.exports = {
  config: {
    name: "ping",
    aliases: ["p"],
    version: "1.0",
    author: "moronali",
    countDown: 3,
    role: 0,
    shortDescription: "Show server ping",
    longDescription: "Shows API/roundtrip ping and event-loop latency",
    category: "utility",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, args, api }) {
    try {
      // 1) measure API send time (approx. RTT to messaging API)
      const tSend = Date.now();
      await message.reply("🔄 Pinging...");
      const apiPing = Date.now() - tSend; // ms

      // 2) measure event-loop latency
      const tLoop = process.hrtime();
      await new Promise((res) => setImmediate(res));
      const diff = process.hrtime(tLoop);
      const loopLatency = (diff[0] * 1000) + (diff[1] / 1e6); // ms

      // 3) optional: process & os uptime
      const procUptime = Math.floor(process.uptime()); // seconds
      const nodeVer = process.version;

      const msg =
        🔵 Server Ping: moronali-ELV\n +
        ________________________\n +
        │ API Ping       : ${apiPing} ms\n +
        │ EventLoop Lat. : ${Math.round(loopLatency)} ms\n +
        │ Process Uptime : ${procUptime} s\n +
        │ Node Version   : ${nodeVer}\n +
        ______________________;

      return message.reply(msg);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Ping failed. Check bot logs.");
    }
  }
};
