module.exports = {
  config: {
    name: "off",
    version: "1.2",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    category: "utility",
    guide: "{p}off confirm",


    
    ownerID: "100046458343946"
  },

  onStart: async function({ api, event, args, message }) {
    const senderID = event.senderID;
    const { ownerID } = module.exports.config;

    if (senderID !== ownerID) {
      return message.reply("⛔ You don't have permission to use this command.");
    }

    if (!args[0] || args[0].toLowerCase() !== "confirm") {
      return message.reply("🤖 Are you sure you want to shut me down?\nIf yes, type: {p}off confirm");
    }

    await message.reply("💤 Shutting down... Goodbye!");
    process.exit(0);
  }
};
