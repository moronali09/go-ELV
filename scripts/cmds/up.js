const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: './bot-data.sqlite' });

// Shutdown হুক
if (!process._statusHookRegistered) {
  process._statusHookRegistered = true;
  const saveShutdownTime = async () => {
    await db.set('lastShutdown', Date.now());
    process.exit();
  };
  process.on("SIGINT", saveShutdownTime);
  process.on("SIGTERM", saveShutdownTime);
}

module.exports = {
  // …config…
  onStart: async function({ message }) {
    const now = Date.now();

    // আগের শাটডাউন
    let offlineText = "No previous shutdown info";
    const last = await db.get('lastShutdown');
    if (last) {
      const diff = Math.floor((now - last) / 1000);
      // …দিন/ঘন্টা/মিনিট/সেকেন্ড হিসেব…
      offlineText = `Last offline: ${d}d ${h}h ${m}m ${s}s ago`;
    }

    // uptime
    const uptimeSec = Math.floor(process.uptime());
    // …উপরে যেমন করে ডিসপ্লে করেছ…

    return message.reply(
      `🔵 Uptime: moronali-bot\n` +
      `________________________\n` +
      `Last offline: ${offlineText}\n` +
      // …uptime details…
      `________________________`
    );
  }
};
