const { cmd } = require("../command");
const fetch = require("node-fetch");
const axios = require("axios");

cmd({
  pattern: 'gitclone',
  alias: ["git"],
  desc: "Download GitHub repository as a zip file",
  react: '📦',
  category: "downloader",
  filename: __filename
}, async (conn, m, { from, args, reply }) => {
  try {
    if (!args[0]) {
      return reply("❌ Please provide GitHub URL\nExample: .gitclone https://github.com/officialpkdriller/NEXUS-AI");
    }

    // Extract repo details
    const repoMatch = args[0].match(/github\.com\/([^\/]+)\/([^\/]+)/i);
    if (!repoMatch) {
      return reply("⚠️ Invalid GitHub URL format");
    }

    const [, username, repo] = repoMatch;
    const apiUrl = `https://api.github.com/repos/${username}/${repo}`;
    const zipUrl = `${apiUrl}/zipball/main`;

    // Verify repository exists
    const { data: repoData } = await axios.get(apiUrl, {
      headers: { 'User-Agent': 'NEXUS-AI-Bot' }
    });

    // Prepare download
    const fileName = `${repo}-${new Date().toISOString().split('T')[0]}.zip`;
    
    await reply(`📦 *Repository Found*\n\n✨ *${repoData.full_name}*\n📝 ${repoData.description || 'No description'}\n⭐ Stars: ${repoData.stargazers_count}\n🔗 ${repoData.html_url}\n\n⬇️ Downloading zip file...`);

    // Send zip file
    await conn.sendMessage(from, {
      document: { url: zipUrl },
      fileName: fileName,
      mimetype: 'application/zip',
      caption: `📦 *${repoData.full_name}*\n\n🔗 ${repoData.html_url}\n📥 Downloaded via NEXUS-AI`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363288304618280@newsletter',
          newsletterName: "pk-tech",
          serverMessageId: 174
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Gitclone error:', error);
    if (error.response?.status === 404) {
      reply("❌ Repository not found or private");
    } else {
      reply(`⚠️ Download failed: ${error.message}`);
    }
  }
});
