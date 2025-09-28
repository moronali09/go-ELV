const { utils } = global;

module.exports = {
	config: {
		name: "ip",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: "Set server IP/port per group (Java & Bedrock) and send rules after IP",
		category: "config",
		guide: {
			vi: "   {pn} <ip[:port]>: set server ip for this group\n   Ví dụ:\n    {pn} node-2.banglaverse.net:25669\n\n   {pn} reset: remove saved ip for this group",
			en: "   {pn} <ip[:port]>: set server ip for this group\n   Example:\n    {pn} node-2.banglaverse.net:25669\n\n   {pn} reset: remove saved ip for this group"
		}
	},

	langs: {
		vi: {
			reset: "Đã xóa IP của nhóm này.",
			successThisThread: "Đã lưu IP cho nhóm: %1",
			myIP: "Saved IP (this group): %1",
			rulesText: `╭─── 🎮 STAR SMP Rules ───╮

✨ 1. সবার সাথে ফ্রেন্ডলি থাকতে হবে  

🚫 2. চুরি সম্পূর্ণ নিষিদ্ধ  

💥 3. অন্যের বানানো কিছু নষ্ট করা যাবে না  

⚔️ 4. PvP শুধু নির্ধারিত এরিয়াতে  

🏠 5. বাড়ি নির্ধারিত এরিয়াতেই বানাতে হবে  

💬 6. Messenger Group-এ অবশ্যই থাকতে হবে  

╰───────────────────`
		},
		en: {
			reset: "Removed saved IP for this group.",
			successThisThread: "Saved IP for this group: %1",
			myIP: "Saved IP (this group): %1",
			rulesText: `╭─── 🎮 STAR SMP Rules ───╮

✨ 1. সবার সাথে ফ্রেন্ডলি থাকতে হবে  

🚫 2. চুরি সম্পূর্ণ নিষিদ্ধ  

💥 3. অন্যের বানানো কিছু নষ্ট করা যাবে না  

⚔️ 4. PvP শুধু নির্ধারিত এরিয়াতে  

🏠 5. বাড়ি নির্ধারিত এরিয়াতেই বানাতে হবে  

💬 6. Messenger Group-এ অবশ্যই থাকতে হবে  

╰───────────────────`
		}
	},

	onStart: async function ({ message, args, event, getLang }) {
		if (!args[0]) {
			const threadIP = event.threadIP || null;
			const threadPort = event.threadPort || null;
			if (!threadIP) return message.reply(getLang("myIP", "None"));
			return message.reply(getLang("myIP", `${threadIP}${threadPort ? ":" + threadPort : ""}`));
		}

		if (args[0].toLowerCase() === "reset") {
			event.threadIP = null;
			event.threadPort = null;
			return message.reply(getLang("reset"));
		}

		let raw = args[0];
		let ip = raw;
		let port = "25669";

		if (raw.includes(":")) {
			const idx = raw.indexOf(":");
			ip = raw.slice(0, idx);
			const p = raw.slice(idx + 1).trim();
			if (p) port = p;
		} else if (args[1]) {
			port = args[1];
		}

		// সরাসরি save করা
		event.threadIP = ip;
		event.threadPort = port;

		await message.reply(getLang("successThisThread", `${ip}:${port}`));

		// Send Java & Bedrock
		await message.reply("Java");
		await message.reply(`${ip}:${port}`);
		await message.reply("Bedrock");
		await message.reply(`${ip}`);
		await message.reply(`${port}`);

		// 1.5s delay তারপর rules
		await new Promise(resolve => setTimeout(resolve, 1500));
		await message.reply(getLang("rulesText"));
	},

	onChat: async function ({ event, message, getLang }) {
		if (!event.body) return;
		const text = event.body.trim();
		const prefix = (typeof utils.getPrefix === "function")
			? await utils.getPrefix(event.threadID)
			: global.GoatBot.config.prefix;

		if (text.toLowerCase() === "ip" || text === `${prefix}ip`) {
			const threadIP = event.threadIP || null;
			const threadPort = event.threadPort || null;
			const display = threadIP ? `${threadIP}${threadPort ? ":" + threadPort : ""}` : "None";
			return message.reply(getLang("myIP", display));
		}
	}
};
