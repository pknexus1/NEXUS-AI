const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "wstalk",
    alias: ["channelstalk", "chinfo"],
    desc: "Get WhatsApp channel information",
    category: "utility",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) {
            return reply("❌ Please provide a WhatsApp channel URL\nExample: .wstalk https://whatsapp.com/channel/0029VatOy2EAzNc2WcShQw1j");
        }

        const channelId = args[0].match(/channel\/([0-9A-Za-z]+)/i)?.[1];
        if (!channelId) return reply("❌ Invalid WhatsApp channel URL");

        const apiUrl = `https://itzpire.com/stalk/whatsapp-channel?url=https://whatsapp.com/channel/${channelId}`;
        const response = await axios.get(apiUrl);
        const data = response.data.data;

        const channelInfo = `
╭━━〔 *📢 CHANNEL INFO* 〕━━┈⊷
┃ *Title:* ${data.title}
┃ *Followers:* ${data.followers}
┃ *Description:* ${data.description || "No description"}
╰━━━━━━━━━━━━━━━━━━━━━━━⊷
> © Powered by NEXUS-AI | Credits: pkdriller
        `;

        await conn.sendMessage(from, {
            image: { url: data.img },
            caption: channelInfo,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: ["120363288304618280@newsletter"],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363288304618280@newsletter",
                    newsletterName: data.title,
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in wstalk command:", e);
        reply(`❌ Error: ${e.response?.data?.message || e.message}`);
    }
});
