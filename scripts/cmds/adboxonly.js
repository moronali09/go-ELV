module.exports = {
  config: {
    name: "adboxonly",
    aliases: ["onlyadminbox", "onlyowner"],
    version: "1.5",
    author: "NTKhang",
    countDown: 5,
    role: 2,
    description: {
      vi: "bật/tắt chế độ chỉ quản trị của viên nhóm mới có thể sử dụng bot",
      en: "turn on/off only admin of group can use bot"
    },
    category: "box chat",
    guide: {
      vi:
        "   {pn} [on | off]: bật/tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot" +
        "\n   {pn} noti [on | off]: bật/tắt thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot" +
        "\n   {pn} botadmin [on | off]: bật/tắt chế độ chỉ bot-admin (global) mới có thể sử dụng bot",
      en:
        "   {pn} [on | off]: turn on/off the mode only admin of group can use bot" +
        "\n   {pn} noti [on | off]: turn on/off the notification when user is not admin of group use bot" +
        "\n   {pn} botadmin [on | off]: turn on/off the mode only bot-admin (global) can use bot"
    }
  },

  langs: {
    vi: {
      turnedOn: "Đã bật chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
      turnedOff: "Đã tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
      turnedOnNoti: "Đã bật thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
      turnedOffNoti: "Đã tắt thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
      turnedOnBotAdmin: "Đã bật chế độ chỉ bot-admin mới có thể sử dụng bot",
      turnedOffBotAdmin: "Đã tắt chế độ chỉ bot-admin mới có thể sử dụng bot",
      syntaxError: "Sai cú pháp, chỉ có thể dùng {pn} on hoặc {pn} off"
    },
    en: {
      turnedOn: "Turned on the mode only admin of group can use bot",
      turnedOff: "Turned off the mode only admin of group can use bot",
      turnedOnNoti: "Turned on the notification when user is not admin of group use bot",
      turnedOffNoti: "Turned off the notification when user is not admin of group use bot",
      turnedOnBotAdmin: "Turned on the mode only bot-admin can use bot",
      turnedOffBotAdmin: "Turned off the mode only bot-admin can use bot",
      syntaxError: "Syntax error, only use {pn} on or {pn} off"
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang }) {
    // normalize
    const first = args[0] ? args[0].toLowerCase() : null;
    const second = args[1] ? args[1].toLowerCase() : null;

    // decide target and value
    let target = "main"; // "main" => onlyAdminBox, "noti" => notification toggle, "botadmin" => onlyBotAdmin
    let opArg = first; // default op argument is first unless first is a subcommand

    if (first === "noti") {
      target = "noti";
      opArg = second;
    } else if (first === "botadmin" || first === "onlybot") {
      target = "botadmin";
      opArg = second;
    }

    // opArg should be "on" or "off"
    let value;
    if (opArg === "on") value = true;
    else if (opArg === "off") value = false;
    else return message.reply(getLang("syntaxError"));

    try {
      if (target === "noti") {
        // stored key is "hideNotiMessageOnlyAdminBox" -> hide when noti is OFF
        // so store inverse
        await threadsData.set(event.threadID, !value, "data.hideNotiMessageOnlyAdminBox");
        return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
      } else if (target === "botadmin") {
        // only bot-admin (global) can use bot
        await threadsData.set(event.threadID, value, "data.onlyBotAdmin");
        return message.reply(value ? getLang("turnedOnBotAdmin") : getLang("turnedOffBotAdmin"));
      } else {
        // main: only group admins can use bot
        await threadsData.set(event.threadID, value, "data.onlyAdminBox");
        return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
      }
    } catch (e) {
      console.error(e);
      return message.reply("❌ An error occurred while saving settings.");
    }
  }
};
