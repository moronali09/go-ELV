module.exports = {
  config: {
    name: "clear",
    aliases: [],
    author: "moronali",
    version: "2.1",
    cooldowns: 5,
    role: 2,
    shortDescription: {
      en: ""
    },
    longDescription: {
      en: "unsend all messages sent by bot (from newest -> oldest)"
    },
    category: "owner",
    guide: {
      en: "{p}{n} [limit] — unsend bot messages from newest to oldest, optional limit (default: all fetched)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;

    // optional: user can pass a limit: /clear 20  (to unsend at most last 20 bot messages)
    let userLimit = null;
    if (args && args[0]) {
      const n = parseInt(args[0]);
      if (!isNaN(n) && n > 0) userLimit = n;
    }

    // helper sleep to avoid rate limits
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const perUnsendDelay = 800; // ms between unsend calls (adjust if needed)

    try {
      // fetch history (increase or decrease limit depending on your API capabilities)
      // Note: some APIs cap the number; adjust 200 as needed.
      const historyLimit = 200;
      const allMessages = await api.getThreadHistory(threadID, historyLimit);

      if (!Array.isArray(allMessages) || allMessages.length === 0) {
        return api.sendMessage("No messages found in this thread.", threadID);
      }

      // filter only messages sent by the bot itself
      const botId = api.getCurrentUserID();
      const botMessages = allMessages.filter(m => m.senderID === botId);

      if (!botMessages.length) {
        return api.sendMessage("No bot-sent messages to unsend.", threadID);
      }

      // If user provided a limit, take only the newest N bot messages
      // We want to start unsending from the newest -> oldest (bottom -> top)
      // Ensure we unsend newest first by iterating from index 0 if botMessages is newest-first,
      // but to be safe, we'll sort by timestamp DESC then iterate in that order.
      const sortedDesc = botMessages.slice().sort((a, b) => {
        // prefer timestamp fields; fall back to messageID string compare if absent
        const ta = a.timestamp || 0;
        const tb = b.timestamp || 0;
        return tb - ta;
      });

      const toUnsend = userLimit ? sortedDesc.slice(0, userLimit) : sortedDesc;

      // Unsending newest -> oldest
      let successCount = 0;
      for (let i = 0; i < toUnsend.length; i++) {
        const msg = toUnsend[i];
        try {
          await api.unsendMessage(msg.messageID);
          successCount++;
        } catch (err) {
          console.warn(`Failed to unsend message ${msg.messageID}:`, err?.message || err);
          // continue with next message
        }
        // small delay to reduce chance of rate limits/errors
        await sleep(perUnsendDelay);
      }

      return api.sendMessage(`✅ Done. Unsent ${successCount} bot message(s).`, threadID);
    } catch (err) {
      console.error("clear command error:", err);
      return api.sendMessage("❌ An error occurred while trying to clear messages.", threadID);
    }
  }
};
