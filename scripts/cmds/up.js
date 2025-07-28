const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    version: "3.1",
    author: "nexo_here",
    cooldowns: 5,
    role: 0,
    shortDescription: "Show system status",
    longDescription: "Display uptime, RAM, CPU, load, platform, etc.",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function({ message }) {
    const uptimeSec = Math.floor(process.uptime());
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;
    const botUptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);

    const cpus = os.cpus();
    const model = cpus[0].model;
    const cores = cpus.length;
    const load = os.loadavg()[0].toFixed(2);
    const cpuPercent = Math.min((load / cores) * 100, 100).toFixed(1);

    const infoLines = [];
    infoLines.push(`Uptime       : ${botUptime}`);
    infoLines.push(`CPU          : ${model} (${cores} cores)`);
    infoLines.push(`Load Average : ${load} / ${cpuPercent}%`);
    infoLines.push(`RAM Usage    : ${(usedMem/1024/1024).toFixed(1)} MB / ${(totalMem/1024/1024).toFixed(1)} MB (${ramPercent}%)`);
    infoLines.push(`Platform     : ${os.platform()} (${os.arch()})`);
    infoLines.push(`Node Version : ${process.version}`);
    infoLines.push(`Host Name    : ${os.hostname()}`);

    const output = infoLines.join("\n");
    return message.reply(output);
  }
};
