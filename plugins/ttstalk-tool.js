const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "tiktokstalk",
    alias: ["tstalk", "ttstalk"],
    react: "🔍",
    desc: "Fetch TikTok user profile information.",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, q, sender, reply }) => {
    try {
        if (!q) {
            return reply("⚠️ Please provide a TikTok username.\n\n💡 *Example:* `.tiktokstalk nexus_ai`");
        }

        const apiURL = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiURL);

        if (!data.status) {
            return reply("🚫 Could not find that TikTok account. Check the username and try again.");
        }

        const { user, stats } = data.data;

        const profileMessage = `
━━━━━━━━━━━━━━━━━━━━━━
🌐 *NEXUS-AI TikTok Lookup*
_Credits: pkdriller_
━━━━━━━━━━━━━━━━━━━━━━

👤 *Username:* @${user.uniqueId}
🏷 *Nickname:* ${user.nickname}
✔️ *Verified:* ${user.verified ? "Yes" : "No"}
📍 *Region:* ${user.region}
📝 *Bio:* ${user.signature || "No bio set"}
🔗 *Bio Link:* ${user.bioLink?.link || "N/A"}

📊 *Statistics:*
👥 Followers: ${stats.followerCount.toLocaleString()}
👤 Following: ${stats.followingCount.toLocaleString()}
❤️ Likes: ${stats.heartCount.toLocaleString()}
🎥 Videos: ${stats.videoCount.toLocaleString()}

📅 *Created:* ${new Date(user.createTime * 1000).toLocaleDateString()}
🔒 *Private Account:* ${user.privateAccount ? "Yes 🔒" : "No 🌍"}

🔗 *Profile URL:* https://www.tiktok.com/@${user.uniqueId}
━━━━━━━━━━━━━━━━━━━━━━
`;

        await conn.sendMessage(from, {
            image: { url: user.avatarLarger },
            caption: profileMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "NEXUS-AI",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("❌ TikTok stalk error:", err);
        reply("⚠️ Something went wrong while fetching TikTok data.");
    }
});
