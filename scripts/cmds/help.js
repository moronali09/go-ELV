module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "2.1",
    author: "moronali",
    shortDescription: "Show all available commands (paginated)",
    category: "system",
    guide: "{pn} [page number]"
  },

  onStart: async function({ message, args, prefix }) {
    const allCommands = Array.from(global.GoatBot.commands.values());
    const names = allCommands
      .map(cmd => cmd.config.name)
      .sort((a, b) => a.localeCompare(b));

    const pageSize = 10; // commands per page
    const totalPages = Math.ceil(names.length / pageSize);

    // Determine requested page
    let page = parseInt(args[0], 10);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    // Slice commands for this page
    const start = (page - 1) * pageSize;
    const paged = names.slice(start, start + pageSize);

    // Build reply
    const header = `Commands (Page ${page}/${totalPages}):`;
    const list = paged.join(", ");
    const footer = `Type \`${prefix}help ${page + 1}\` for next page.`;

    return message.reply(`${header}\n${list}\n${footer}`);
  }
};
