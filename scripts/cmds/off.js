module.exports = {
    config: {
        name: "off",
        version: "1.0",
        author: "MahMUD",
        countDown: 0,
        role: 2,
        category: "utility",
        guide: "{p}off"
    },

    onStart: async function ({ api, event, message }) {

        await message.reply("Bot is shutting down...");

        process.exit(0);
    }
};
