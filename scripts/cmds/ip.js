module.exports = {
    config: {
        name: "ip",
        version: "1.0",
        author: "Mohan",
        countDown: 5,
        role: 0,
        description: "Gives STAR SMP server IP info",
        category: "info",
        guide: {
            vi: "{pn}: Xem IP của STAR SMP",
            en: "{pn}: Show STAR SMP server IP"
        }
    },

    langs: {
        vi: {},
        en: {}
    },

    onStart: async function({ message, event }) {
        const threadID = event.threadID;
        const reply = `✨ STAR SMP — Server IP (24/7 Paid Server):

🔹 Java (PC): node-2.banglaverse.net:25669
🔹 Bedrock (PE):
IP: node-2.banglaverse.net
Port: 25669

✨ STAR SMP — Join Now! ✨

📌 Group UID: ${threadID}`;

        return message.reply(reply);
    }
};
