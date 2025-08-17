const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "repo",
    alias: ["github", "code"],
    use: '.repo',
    desc: "Display NEXUS-AI repository information",
    category: "main",
    react: "📦", 
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const repoUrl = "https://github.com/officialpkdriller/NEXUS-AI";
        const repoImage = "https://opengraph.githubassets.com/123456789abcdef/officialpkdriller/NEXUS-AI"; // Auto-generated GitHub OG image

        // Basic repo info that doesn't need API
        const staticRepoInfo = `
📦 *NEXUS-AI REPOSITORY* 

✨ *Advanced WhatsApp Bot Solution*
🔹 *Developer*: PK-TECH
🔹 *Language*: JavaScript/Node.js
🔹 *License*: MIT

🔗 *Repository Link*:
${repoUrl}

💻 *Clone Command*:
\`\`\`git clone ${repoUrl}.git\`\`\`

⭐ *Star the repo to support development!*

✨ *Powered by PK-TECH*
`;

        // Try to fetch additional info from GitHub API
        try {
            const { data } = await axios.get(`https://api.github.com/repos/officialpkdriller/NEXUS-AI`);
            
            const dynamicInfo = `
🌟 *Stars*: ${data.stargazers_count}
🍴 *Forks*: ${data.forks_count} 
📝 *Last Updated*: ${new Date(data.updated_at).toLocaleDateString()}
`;
            
            await conn.sendMessage(from, {
                image: { url: repoImage },
                caption: staticRepoInfo + dynamicInfo,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363288304618280@newsletter',
                        newsletterName: "pk-tech",
                        serverMessageId: 166
                    }
                }
            }, { quoted: mek });
            
        } catch (apiError) {
            // Fallback if API fails
            await conn.sendMessage(from, { 
                image: { url: repoImage },
                caption: staticRepoInfo,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363288304618280@newsletter',
                        newsletterName: "pk-tech",
                        serverMessageId: 166
                    }
                }
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Repo command error:", e);
        reply(`📦 *NEXUS-AI Repository*:\n${repoUrl}\n\n✨ *Powered by PK-TECH*`);
    }
});
