const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "quote",
    alias: ["inspire", "motivate"],
    use: '.quote',
    desc: "Send a random inspirational quote.",
    category: "fun",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const res = await axios.get("https://zenquotes.io/api/random");
        const { q: content, a: author } = res.data[0];

        const quoteMessage = `
💡 *Quote of the Day*
────────────────────
"${content}"
— *${author}*
────────────────────
✨ Stay positive and keep moving forward!
        `.trim();

        await conn.sendMessage(from, {
            text: quoteMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "pk-tech",
                    serverMessageId: 146
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in quote command:", e);
        reply(`❌ Could not fetch quote: ${e.message}`);
    }
});
