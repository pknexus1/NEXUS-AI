const { cmd } = require('../command');

cmd({
    pattern: "speed",
    alias: ["speedtest"],
    react: "⚡",
    desc: "Speed test menu",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Send interactive buttons only
        await conn.sendMessage(from, {
            text: "⚡ *SPEED TEST MENU*\nChoose an option:",
            buttons: [
                {buttonId: 'speed-btn', buttonText: {displayText: '🚀 Speed Test'}, type: 1},
                {buttonId: 'ping-btn', buttonText: {displayText: '🏓 Ping Test'}, type: 1}
            ],
            footer: "NEXUS-AI"
        }, { quoted: mek });

        // Optional: Add reaction to show command was received
        await conn.sendMessage(from, {
            react: {
                text: "⚡",
                key: mek.key
            }
        });

    } catch (e) {
        console.error("Speed command error:", e);
        reply("❌ Failed to show menu");
    }
});
