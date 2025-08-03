const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
    config: {
        name: "song",
        version: "1.9",
        author: "MahMUD", 
        countDown: 10,
        role: 0,
        category: "music",
        guide: "{p}song [song name]"
    },

    onStart: async function ({ api, event, args, message }) {
        if (args.length === 0) {
            return message.reply("⚠ | Please provide a song name");
        }

        try {
            const query = encodeURIComponent(args.join(" "));
            const baseUrl = await mahmud();

            const metaRes = await axios.get(`${baseUrl}/api/sing?text=${query}`);
            const { title, thumbnail, audioUrl } = metaRes.data;

            await message.reply({ body: `${title}` });

            if (thumbnail) {
                await message.reply({ attachment: thumbnail });
            }

            const audioStream = await axios.get(audioUrl || `${baseUrl}/api/sing2?songName=${query}`, {
                responseType: "stream",
                headers: { "author": module.exports.config.author }
            });

            await message.reply({ attachment: audioStream.data });

        } catch (error) {
            console.error("Error:", error.message);

            if (error.response) {
                console.error("Response error data:", error.response.data);
                console.error("Response status:", error.response.status);
                return message.reply(`${error.response.data.error || error.message}`);
            }

            message.reply("❌ | An error occurred while fetching the song.");
        }
    }
};
