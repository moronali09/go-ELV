module.exports = {
  config: {
    name: "help",
    aliases: []
    version: "2.1",
    author: "moronali",
    shortDescription: "Show all available commands",
    longDescription: "Display all command names page by page.",
    category: "system",
    guide: "{pn} [page or command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const cmdArray = [...allCommands.keys()].sort((a, b) => a.localeCompare(b));
    const pageSize = 10;

    // Show detailed command info
    const query = args[0]?.toLowerCase();
    if (query && isNaN(query)) {
      const cmd = allCommands.get(query) || [...allCommands.values()].find(c => c.config.aliases?.includes(query));
      if (!cmd) return message.reply(`Command "${query}" not found.`);
      const { name, category, aliases, version, author, guide } = cmd.config;
      const usage = guide?.replace(/{pn}/g, prefix + name) || "None";
      return message.reply(
        [
          `      cmd: ${name}`,
          `Category: ${category || "other"}`,
          aliases?.length ? `Aliases: ${aliases.join(", ")}` : null,
          `Version: ${version}`,
          `               moronali\n\n`,
          `Usage: ${usage}`
        ].filter(Boolean).join("\n")
      );
    }

    // Paginated command list
    const page = parseInt(args[0]) || 1;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const totalPages = Math.ceil(cmdArray.length / pageSize);
    const sliced = cmdArray.slice(start, end);

    const msg = [
      `📘 Help Menu (Page ${page}/${totalPages})`,
      "________________________",
      ...sliced.map(cmd => `• ${cmd}`),
      "________________________",
      `Type "${prefix}help [name]" to see details`
    ].join("\n");

    return message.reply(msg);
  }
};
