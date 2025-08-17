const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "alive",
    alias: ["status", "bot"],
    use: '.alive',
    desc: "Check if bot is alive and running.",
    category: "main",
    react: "💖",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        const aliveMessage = `
*🌟 NEXUS-AI IS ALIVE 🌟*
────────────────────
🤖 *Bot Name:* Nexus-AI
👤 *Owner:* PK-Tech
⚡ *Uptime:* Online & Running
📡 *Ping:* ${responseTime.toFixed(2)}ms ${reactionEmoji}
────────────────────
💬 Type *.help* to see commands.
        `.trim();

        await conn.sendMessage(from, {
            text: aliveMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "pk-tech",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
