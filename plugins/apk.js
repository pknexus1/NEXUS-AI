const { cmd } = require('../command');
const axios = require("axios");

cmd({
  pattern: "apk",
  desc: "Download APK from Aptoide",
  category: "download",
  use: ".apk <app name>",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide an app name to search.");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // Correct API endpoint
    const apiUrl = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(q)}&limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.datalist?.list?.length) {
      return reply("⚠️ No results found for the given app name.");
    }

    const app = data.datalist.list[0];
    const appSize = app.size ? (app.size / 1048576).toFixed(2) : "Unknown";

    const caption = `╭━━⪨ *APK Downloader* ⪩━━┈⊷
┃ 📦 *NAME:* ${app.name}
┃ 🏋 *SIZE:* ${appSize} MB
┃ 📦 *PACKAGE:* ${app.package || "Unknown"}
┃ 📅 *UPDATED ON:* ${app.updated || "N/A"}
┃ 👨‍💻 *DEVELOPER:* ${app?.developer?.name || "Unknown"}
╰━━━━━━━━━━━━━━━┈⊷
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ NEXUS-AI*`;

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    // Send APK with external preview
    await conn.sendMessage(from, {
      document: { url: app.file?.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption,
      contextInfo: {
        externalAdReply: {
          title: app.name,
          body: "APK Downloader - Join our WhatsApp Channel",
          mediaType: 1,
          thumbnailUrl: app.icon || "https://files.catbox.moe/u4l28f.jpg",
          sourceUrl: "https://whatsapp.com/channel/0029Vad7YNyJuyA77CtIPX0x",
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the APK. Please try again.");
  }
});
      
