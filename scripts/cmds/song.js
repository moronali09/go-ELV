const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
    config: {
        name: "song",
        version: "1.4",
        author: "moronali", 
        countDown: 10,
        role: 0,
        category: "music",
        guide: "{p}song [song name]"
    },

    onStart: async function ({ api, event, args, message }) {
        if (args.length === 0) {
            return message.reply("❌ Please provide a song name.\nExample: song lofi beats");
        }

        try {
            const query = encodeURIComponent(args.join(" "));
            const baseUrl = await mahmud();
            const apiUrl = `${baseUrl}/api/sing2?songName=${query}`;

            const response = await axios.get(apiUrl, {
                responseType: "stream",
                headers: { "author": module.exports.config.author }
            });

            await message.reply({ attachment: response.data });

        } catch (error) {
            console.error("Error fetching song:", error.message);

            if (error.response && error.response.data) {
                return message.reply(`❌ ${error.response.data.error || error.message}`);
            }
            message.reply("❌ An unexpected error occurred.");
        }
    }
};
