const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "fact",
    alias: ["facts", "randomfact"],
    use: ".fact",
    desc: "Get a random interesting fact.",
    category: "fun",
    react: "📚",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const { data } = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');

        const factMessage = `
📚 *Random Fact* 📚
────────────────────
${data.text}
────────────────────
💡 Keep learning something new every day!
        `.trim();

        await conn.sendMessage(from, {
            text: factMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "pk-tech",
                    serverMessageId: 200
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error('Error fetching fact:', error.message);
        reply('❌ Could not fetch fact. Please try again later.');
    }
});
