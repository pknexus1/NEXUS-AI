const { cmd } = require('../command');
const { runtime } = require('../lib/functions'); // tunaimport runtime function

cmd({
    pattern: "uptime",
    alias: ["runtime"],
    use: ".uptime",
    desc: "Show how long the bot has been running.",
    category: "main",
    react: "⏱️",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const uptime = runtime(process.uptime());

        const uptimeMessage = `
*⏱️ BOT UPTIME ⏱️*
────────────────────
🤖 Nexus-AI has been running for:
➡️ ${uptime}
        `.trim();

        await conn.sendMessage(from, {
            text: uptimeMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    serverMessageId: 1
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in uptime command:", e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
