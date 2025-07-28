module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "2.0",
    author: "nexo_here",
    shortDescription: "Show all available commands",
    longDescription: "Display a categorized list of all available commands.",
    category: "system",
    guide: "{pn} [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    // Group commands by category
    for (const [name, cmd] of allCommands) {
      const cat = cmd.config.category || "others";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({
        name: cmd.config.name,
        desc: cmd.config.shortDescription || ""
      });
    }

    // Detailed info for a specific command
    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd =
        allCommands.get(query) ||
        [...allCommands.values()].find(c => c.config.aliases?.includes(query));
      if (!cmd)
        return message.reply(`Command "${query}" not found.`);

      const { name, shortDescription, longDescription, category, aliases, version, author, guide } = cmd.config;
      const usage = guide.replace(/{pn}/g, prefix + name);

      const info = [];
      info.push(`Name: ${name}`);
      info.push(`Category: ${capitalize(category)}`);
      info.push(`Description: ${longDescription || shortDescription || "No description."}`);
      if (aliases?.length) info.push(`Aliases: ${aliases.join(", ")}`);
      info.push(`Version: ${version}`);
      info.push(`Author: ${author}`);
      info.push(`Usage: ${usage}`);

      return message.reply(`Command Information:\n${info.join("\n")}`);
    }

    // Build general help menu
    let msg = "Help Menu\n\nCommands:\n\n";
    const sortedCats = Object.keys(categories).sort();
    for (const cat of sortedCats) {
      msg += `${capitalize(cat)}:\n`;
      const list = categories[cat]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(c => `- ${c.name}${c.desc ? `: ${c.desc}` : ""}`)
        .join("\n");
      msg += list + "\n\n";
    }

    msg += `Type "${prefix}help [command]" for more info.`;
    return message.reply(msg);
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
