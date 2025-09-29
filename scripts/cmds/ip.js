const ALLOWED_THREAD = "30017677721164007";
const FIXED_IP = "node-2.banglaverse.net";
const FIXED_PORT = "25669";

async function sendIPSequence(message) {
  // Send Java/Bedrock sequence + rules
  await message.reply("Java");
  await message.reply(`${FIXED_IP}:${FIXED_PORT}`);
  await message.reply("Bedrock");
  await message.reply(`${FIXED_IP}`);
  await message.reply(`${FIXED_PORT}`);
  await new Promise(res => setTimeout(res, 4000));
  await message.reply(
`╭─── 🎮 STAR SMP Rules ───╮

✨ 1. সবার সাথে ফ্রেন্ডলি থাকতে হবে  

🚫 2. চুরি সম্পূর্ণ নিষিদ্ধ  

💥 3. অন্যের বানানো কিছু নষ্ট করা যাবে না  

⚔️ 4. PvP শুধু নির্ধারিত এরিয়াতে  

🏠 5. বাড়ি নির্ধারিত এরিয়াতেই বানাতে হবে  

💬 6. Messenger Group-এ অবশ্যই থাকতে হবে  

╰───────────────────`
  );
}

module.exports = {
  config: {
    name: "ip",
    version: "1.8",
    author: "Custom",
    countDown: 5,
    role: 0,
    description: "Respond to `ip` (prefix-free) in specific group or via command",
    category: "config"
  },

  onStart: async function ({ message, args, event }) {
    if (event.threadID !== ALLOWED_THREAD) {
      return message.reply("❌ | set nei, morona ke inbox koro ");
    }

    await sendIPSequence(message);
  },
  onChat: async function ({ event, message }) {
    if (!event.body) return;
    if (event.threadID !== ALLOWED_THREAD) return;

    const text = event.body.trim().toLowerCase();
    if (text === "ip") {
      await sendIPSequence(message);
    }
  }
};
