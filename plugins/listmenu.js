const { cmd, commands } = require('../command');
const moment = require('moment-timezone');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "listmenu",
    desc: "Display a lightweight list of commands",
    category: "main",
    filename: __filename
}, async (conn, m, { reply }) => {
    try {
        const dateNow = moment().tz('Africa/Nairobi').format('dddd, MMMM Do YYYY, HH:mm:ss');
        const upTime = runtime(process.uptime());
        const botName = "🤖 NEXUS-AI";
        const ownerName = "👑 PK-Tech";
        const totalCommands = Object.values(commands).length;

        // Group commands by category
        let categorized = {};
        for (let c of Object.values(commands)) {
            if (!categorized[c.category]) categorized[c.category] = [];
            categorized[c.category].push(c.pattern);
        }

        let menuText = `📌 *${botName} Lite Menu*\n`;
        menuText += `📅 Date: ${dateNow}\n⏳ Uptime: ${upTime}\n👤 Owner: ${ownerName}\n📌 Total Commands: ${totalCommands}\n`;
        menuText += "────────────────────\n";

        for (let category in categorized) {
            menuText += `📂 *${category.toUpperCase()}*\n`;
            menuText += categorized[category].map(cmd => `> .${cmd}`).join("\n") + "\n";
        }

        menuText += "────────────────────\n";
        menuText += "💬 Example: > .play song name\n";
        menuText += `✨ Powered by ${botName} ✨`;

        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

    } catch (e) {
        console.error("Lite Menu Error:", e);
        reply("❌ Failed to fetch lite menu.");
    }
});
