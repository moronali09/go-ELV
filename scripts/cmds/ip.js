const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "ip",
		version: "1.3",
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
			confirmThisThread: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi IP cho nhóm chat của bạn",
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
			confirmThisThread: "Please react to this message to confirm change of IP for this group",
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

	onStart: async function ({ message, args, event, commandName, getLang }) {
		if (!args[0]) {
			const threadIP = await global.GoatBot.modules?.threadsData?.get?.(event.threadID, "data.serverIP");
			const threadPort = await global.GoatBot.modules?.threadsData?.get?.(event.threadID, "data.serverPort");
			if (!threadIP) return message.reply(getLang("myIP", "None"));
			return message.reply(getLang("myIP", `${threadIP}${threadPort ? ":" + threadPort : ""}`));
		}

		if (args[0].toLowerCase() === "reset") {
			await global.GoatBot.modules?.threadsData?.set?.(event.threadID, null, "data.serverIP");
			await global.GoatBot.modules?.threadsData?.set?.(event.threadID, null, "data.serverPort");
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

		const formSet = {
			commandName,
			author: event.senderID,
			ip,
			port
		};

		return message.reply(getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, event, Reaction, getLang }) {
		const { author, ip, port } = Reaction;
		if (event.userID !== author) return;
		await global.GoatBot.modules?.threadsData?.set?.(event.threadID, ip, "data.serverIP");
		await global.GoatBot.modules?.threadsData?.set?.(event.threadID, port, "data.serverPort");
		await message.reply(getLang("successThisThread", `${ip}:${port}`));
		await message.reply("Java");
		await message.reply(`${ip}:${port}`);
		await message.reply("Bedrock");
		await message.reply(`${ip}`);
		await message.reply(`${port}`);
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
			const threadIP = await global.GoatBot.modules?.threadsData?.get?.(event.threadID, "data.serverIP");
			const threadPort = await global.GoatBot.modules?.threadsData?.get?.(event.threadID, "data.serverPort");
			const display = threadIP ? `${threadIP}${threadPort ? ":" + threadPort : ""}` : "None";
			await message.reply(getLang("myIP", display));
		}
	}
};
