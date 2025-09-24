module.exports = {
  config: {
    name: "ip",
    version: "1.0",
    author: "moronali",
    countDown: 0,
    role: 0,
    category: "info",
    guide: "Just type 'STAR SMP' in the group"
  },

  onStart: async function({ api, event, message }) {
    const groupUID = "30017677721164007"; // ekhane group UID boshabe

    // Check group UID
    if (event.threadID !== groupUID) return;

    // Check exact message (no prefix)
    if (event.body && event.body.toLowerCase() === "star smp") {
      const replyMessage = `✨ STAR SMP — Server IP (24/7 Paid Server):

🔹 Java (PC): node-2.banglaverse.net:25669
🔹 Bedrock (PE):
IP: node-2.banglaverse.net
Port: 25669

✨ STAR SMP — Join Now! ✨`;

      api.sendMessage(replyMessage, event.threadID);
    }
  }
};
