const ALLOWED_THREAD = "30017677721164007";
const FIXED_IP = "node-2.banglaverse.net";
const FIXED_PORT = "25740";

async function sendPlain(message, text) {
  if (!message) return;
  if (typeof message.send === "function") return message.send(text);

  return message.reply ? message.reply(text) : null;
}

async function sendIPSequence(message) {

  await sendPlain(message, "Java");
  await sendPlain(message, `${FIXED_IP}:${FIXED_PORT}`);
  await sendPlain(message, "Bedrock");
  await sendPlain(message, `${FIXED_IP}`);
  await sendPlain(message, `${FIXED_PORT}`);
  await new Promise(res => setTimeout(res, 3000));
  await sendPlain(message,
`╭──🎮 STAR SMP Rules─╮

✨ 1. সবার সাথে ফ্রেন্ডলি থাকতে হবে  

🚫 2. চুরি সম্পূর্ণ নিষিদ্ধ  

💥 3. অন্যের বানানো কিছু নষ্ট করা যাবে না  

⚔️ 4. PvP শুধু নির্ধারিত এরিয়াতে  

🏠 5. বাড়ি নির্ধারিত এরিয়াতেই বানাতে হবে  

💬 6. Messenger Group-এ অবশ্যই থাকতে হবে  

╰──────────────────`
  );
}

module.exports = {
  config: {
    name: "ip",
    version: "1.9",
    author: "Custom",
    countDown: 50,
    role: 0,
    description: "Respond to `ip` (prefix-free)",
    category: "config"
  },

  onStart: async function ({ message, args, event }) {
    if (event.threadID !== ALLOWED_THREAD) {
      return sendPlain(message, "❌ | ip set nei, inbox moronali\nuid: 100046458343946");
    }

    if (event.messageReply || event.isReply) return;

    await sendIPSequence(message);
  },
  onChat: async function ({ event, message }) {
    if (!event.body) return;
    if (event.threadID !== ALLOWED_THREAD) return;
    if (event.messageReply || event.isReply) return;

    const body = event.body;
    const trimmed = body.trim().toLowerCase();

    if (trimmed === "ip") return;

    const ipRegex = /\bip\b/i;
    if (ipRegex.test(body)) {
      await sendIPSequence(message);
    }
  }
};
