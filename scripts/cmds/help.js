module.exports = {
  config: {
    name: "help",
    aliases: [],
    version: "2.2",
    author: "moronali",
    shortDescription: "Show all available commands",
    longDescription: "Display all command names page by page.",
    category: "system",
    guide: "{pn} [page or command name]"
  },

  onStart: async function ({ message, args }) {
    const allCommands = global.GoatBot.commands;
    const cmdArray = [...allCommands.keys()].sort((a, b) => a.localeCompare(b));
    const pageSize = 10;

    const rawQuery = args[0];
  
    const query = rawQuery ? rawQuery.replace(/^\//, "").toLowerCase() : null;

    const formatUsage = (name, guide) => {
      if (typeof guide === "string") return guide.replace(/{pn}/g, `/${name}`);
      return `/${name}`;
    };

  
    if (query === "all") {
      const lines = cmdArray.map(name => {
        const cmd = allCommands.get(name);
        const short = cmd?.config?.shortDescription || "";
        return `• ${name}${short ? " — " + short : ""}`;
      });

      const msg = [
        `📘 Help (All commands)`,
        "────────────────────────",
        ...lines,
        "────────────────────────",
        `Use "/help [name]" to see a command's details.`
      ].join("\n");

      return message.reply(msg);
    }

    // If query exists and is not a number -> try to find a command by name or alias
    if (query && isNaN(query)) {
      const cmd =
        allCommands.get(query) ||
        [...allCommands.values()].find(c =>
          (c.config?.aliases || []).map(a => a.toLowerCase().replace(/^\//, "")).includes(query)
        );

      if (!cmd) return message.reply(`Command "/${query}" not found.`);

      const {
        name,
        aliases = [],
        version,
        author,
        guide,
        shortDescription,
        longDescription,
        category
      } = cmd.config || {};
      const usage = formatUsage(name, guide);
      const description = shortDescription || longDescription || "No description";


      const detail = [
        `📌 /${name} — ${description}`,
        `┊ Category: ${category || "other"} ┊ Version: ${version || "?"} ┊ Author: moronali`,
        `┊ Aliases: ${aliases.length ? aliases.map(a => `/${a}`).join(", ") : "None"}`,
        `┊ Usage: ${usage}`
      ].join("\n");

      return message.reply(detail);
    }

    // Otherwise treat as page number (or default to 1)
    const pageNum = Math.max(1, parseInt(args[0]) || 1);
    const totalPages = Math.max(1, Math.ceil(cmdArray.length / pageSize));
    const safePage = Math.min(pageNum, totalPages);

    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    const sliced = cmdArray.slice(start, end);

    const msg = [
      `📘 Help Menu (Page ${safePage}/${totalPages})`,
      "────────────────────────",
      ...sliced.map(cmd => `• ${cmd}`),
      "────────────────────────",
      `Use "/help [name]" to see a command's details or "/help all" to list everything.`
    ].join("\n");

    return message.reply(msg);
  }
};
