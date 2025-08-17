const { cmd, commands } = require('../command');
const moment = require('moment-timezone');
const { runtime } = require('../lib/functions');
const os = require('os');

cmd({
    pattern: "menu",
    desc: "Display NEXUS-AI Command Menu",
    category: "main",
    filename: __filename
}, async (conn, m, { reply }) => {
    try {
        // System Info
        const dateNow = moment().tz('Africa/Nairobi').format('dddd, MMMM Do YYYY, HH:mm:ss');
        const upTime = runtime(process.uptime());
        const botName = "NEXUS-AI";
        const ownerName = "PK-TECH";
        const totalCommands = Object.values(commands).length;
        const prefix = "*";
        const ramUsage = `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`;

        // Quote System
        const quotes = [
            "✨ Keep smiling, life is beautiful!",
            "🚀 Code, create, conquer!",
            "💡 Innovation distinguishes the leader from the follower.",
            "🎯 Focus on progress, not perfection.",
            "🌟 Stay positive and keep moving forward."
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // Command Grouping
        let categorized = {};
        for (let c of Object.values(commands)) {
            if (!categorized[c.category]) categorized[c.category] = [];
            categorized[c.category].push(c.pattern);
        }

        // Build Menu Header with Flowers
        let menuText = `
╭─⋄⋅🌺⋅⋄──⋅🌷⋅──⋄⋅🌸⋅⋄─╮
       ${botName.toUpperCase()}
╰─⋄⋅🌼⋅⋄──⋅🌹⋅──⋄⋅💮⋅⋄─╯

╭────────────────────╮
⋅📆 .*DATE*  : ${dateNow}
─────────────────────
⋅⏰ .*UPTIME*: ${upTime}
─────────────────────
⋅👤 .*OWNER* : ${ownerName}
─────────────────────
⋅📜 .*CMDS*  : ${totalCommands}
─────────────────────
⋅🛡️ .*PREFIX*: ${prefix}
─────────────────────
⋅💎 .*RAM*   : ${ramUsage}
╰────────────────────╯

╭───────────────╮
│  *COMMAND LIST* │
╰───────────────╯
${'\u200B'.repeat(4001)}  💎
`;

        // Original Command Formatting
        for (let category in categorized) {
            menuText += `\n★ *${category.toUpperCase()}*\n`;
            categorized[category].forEach(cmd => {
                menuText += `> ☆ *${cmd}*\n`;
            });
        }

        // Footer
        menuText += `
╭────────────────╮
│  💬 "${randomQuote}"
│  
│  ✨ Powered by Baileys
│  🏆 PK-TECH Edition
╰────────────────╯
`;

        // Send Menu
        await conn.sendMessage(m.chat, {
            image: { url: "https://i.postimg.cc/k5pGMNyR/7f503f3c-bb3e-4a3d-8950-bc1a31642480.jpg" },
            caption: menuText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363288304618280@newsletter",
                    newsletterName: "NEXUS-AI",
                    serverMessageId: -1
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error("Menu Error:", e);
        reply("❌ Failed to display menu");
    }
});
