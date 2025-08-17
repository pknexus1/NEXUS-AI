const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speedtest", "latency"],
    use: '.ping',
    desc: "Check bot's response time with style.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        // Random emojis & quotes
        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        const quotes = [
            "Speed is my middle name!",
            "Faster than light ⚡",
            "Zoom zoom... 🚀",
            "I was born to be quick!",
            "No lag here 😎"
        ];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // React with emoji
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const pingSpeed = (end - start) / 1000;

        // Stylish Ping Message
        const pingMessage = `
╭───〔 *PING STATUS* 〕───╮
│ 📡 *Speed:* ${pingSpeed.toFixed(2)}ms ${reactionEmoji}
│ 💬 *Quote:* ${randomQuote}
│ 🤖 *Bot:* Nexus-AI
│ 👤 *Owner:* PK-Tech
╰──────────────────────╯
        `.trim();

        await conn.sendMessage(from, {
            text: pingMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "pk-tech",
                    serverMessageId: 144
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
                    
