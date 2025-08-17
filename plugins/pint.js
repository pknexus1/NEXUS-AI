const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pinterest",
    alias: ["pindl"],
    react: "📌",
    desc: "Download Pinterest videos or images",
    category: "media",
    use: '.pinterest <url>',
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        if (!q) return reply("Please provide a Pinterest URL\nExample: .pinterest https://pin.it/example");

        // Validate Pinterest URL
        if (!q.match(/pinterest\.com|pin\.it/)) {
            return reply("Invalid Pinterest URL. Please provide a valid Pinterest link");
        }

        // Create interactive buttons
        const buttons = [
            {buttonId: 'pindl-video', buttonText: {displayText: 'Download Video'}, type: 1},
            {buttonId: 'pindl-image', buttonText: {displayText: 'Download Image'}, type: 1}
        ];

        const buttonMessage = {
            text: "📌 *Pinterest Downloader*\n\nChoose what you want to download:",
            footer: "Powered by NEXUS-AI",
            buttons: buttons,
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

        // Handle button responses
        conn.on('message.buttons.response', async (response) => {
            if (response.from === from && response.selectedButtonId) {
                try {
                    await reply("⏳ Processing your request...");

                    // Using KlickPin API for downloads :cite[2]:cite[6]
                    const apiUrl = `https://klickpin.com/api/download?url=${encodeURIComponent(q)}`;
                    const apiRes = await axios.get(apiUrl);

                    if (!apiRes.data.success) {
                        return reply("Failed to fetch media. The pin might be private or restricted.");
                    }

                    if (response.selectedButtonId === 'pindl-video') {
                        if (!apiRes.data.videoUrl) {
                            return reply("No video found in this pin");
                        }

                        await conn.sendMessage(from, {
                            video: { url: apiRes.data.videoUrl },
                            caption: `📹 *Pinterest Video*\n\n🔗 ${q}\n⚡ Powered by NEXUS-AI`
                        }, { quoted: mek });

                    } else if (response.selectedButtonId === 'pindl-image') {
                        if (!apiRes.data.imageUrl) {
                            return reply("No image found in this pin");
                        }

                        await conn.sendMessage(from, {
                            image: { url: apiRes.data.imageUrl },
                            caption: `🖼️ *Pinterest Image*\n\n🔗 ${q}\n⚡ Powered by NEXUS-AI`
                        }, { quoted: mek });
                    }

                } catch (e) {
                    console.error("Pinterest download error:", e);
                    reply("Failed to download. Please try again later.");
                }
            }
        });

    } catch (e) {
        console.error("Pinterest command error:", e);
        reply("An error occurred. Please try again later.");
    }
});
