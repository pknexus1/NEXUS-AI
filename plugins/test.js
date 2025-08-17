const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "test",
    alias: ["check", "verify"],
    use: '.test',
    desc: "Run a simple bot test to check status.",
    category: "main",
    react: "🛠️", // New reaction emoji
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const start = Date.now();

        // React with a different emoji style (no repeats)
        await conn.sendMessage(from, {
            react: { text: "🛠️", key: mek.key }
        });

        // Simulate small processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const end = Date.now();
        const duration = end - start;

        // Minimal and modern test message
        const testMessage = `
✅ *BOT TEST SUCCESSFUL*
──────────────────────
🔹 Status: Online
🔹 Response Time: ${duration}ms
🔹 Mode: Operational
──────────────────────
ℹ️ All systems are running smoothly.
        `.trim();

        await conn.sendMessage(from, {
            text: testMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 10,
                isForwarded: false
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in test command:", e);
        reply(`❌ Test failed: ${e.message}`);
    }
});
