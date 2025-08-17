const config = require('../config');
const { cmd, commands } = require('../command');
const axios = require('axios');
const moment = require('moment'); // npm install moment

cmd({
    pattern: "githubstalk",
    alias: ["ghstalk", "gitstalk"],
    use: '.githubstalk [username]',
    desc: "Get GitHub user information",
    category: "tools",
    react: "👁️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply, args }) => {
    try {
        if (!args[0]) return reply("❌ Please provide a GitHub username!");

        const username = args[0];
        const { data } = await axios.get(`https://api.github.com/users/${username}`);
        
        const createdAt = moment(data.created_at).format("DD/MM/YYYY");
        const updatedAt = moment(data.updated_at).format("DD/MM/YYYY");

        const ghMessage = `
👁️ *GitHub Stalk Results*
────────────────────
👤 *Username:* ${data.login}
📛 *Name:* ${data.name || "Not specified"}
📌 *Bio:* ${data.bio || "No bio"}
🌍 *Location:* ${data.location || "Not specified"}
🔗 *Profile:* ${data.html_url}
────────────────────
📊 *Stats*
📦 *Public Repos:* ${data.public_repos}
📚 *Public Gists:* ${data.public_gists}
👥 *Followers:* ${data.followers}
🫂 *Following:* ${data.following}
────────────────────
📅 *Created:* ${createdAt}
🔄 *Last Updated:* ${updatedAt}
        `.trim();

        await conn.sendMessage(from, {
            text: ghMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "pk-tech",
                    serverMessageId: 153
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("GitHub Stalk error:", e);
        if (e.response?.status === 404) {
            reply("❌ GitHub user not found!");
        } else {
            reply(`❌ GitHub stalk failed: ${e.message}`);
        }
    }
});
