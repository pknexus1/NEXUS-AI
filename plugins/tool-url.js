const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

cmd({
    pattern: "tourl",
    alias: ["imgtourl", "imgurl", "url", "geturl", "upload"],
    react: '🌐',
    desc: "Upload media to Catbox and get a direct link.",
    category: "utility",
    use: ".tourl [reply to media]",
    filename: __filename
}, async (conn, mek, m, { reply, from }) => {
    try {
        const quoted = m.quoted ? m.quoted : m;
        const mimeType = (quoted.msg || quoted).mimetype || '';

        if (!mimeType) return reply("⚠️ Please reply to an *image*, *video*, or *audio* file.");

        const mediaBuffer = await quoted.download();
        const tempPath = path.join(os.tmpdir(), `nexus_upload_${Date.now()}`);
        fs.writeFileSync(tempPath, mediaBuffer);

        let extension = '';
        if (mimeType.includes('jpeg')) extension = '.jpg';
        else if (mimeType.includes('png')) extension = '.png';
        else if (mimeType.includes('video')) extension = '.mp4';
        else if (mimeType.includes('audio')) extension = '.mp3';

        const fileName = `file${extension}`;

        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(tempPath), fileName);
        form.append('reqtype', 'fileupload');

        const res = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders()
        });

        if (!res.data) return reply("❌ Failed to upload media to Catbox.");

        const fileUrl = res.data;
        fs.unlinkSync(tempPath);

        let typeLabel = '📦 File';
        if (mimeType.includes('image')) typeLabel = '🖼 Image';
        else if (mimeType.includes('video')) typeLabel = '🎥 Video';
        else if (mimeType.includes('audio')) typeLabel = '🎵 Audio';

        await conn.sendMessage(from, {
            text:
`╭━━━〔 *NEXUS-AI UPLOADER* 〕━━━╮
┃ 📂 *Type:* ${typeLabel}
┃ 📏 *Size:* ${formatBytes(mediaBuffer.length)}
┃ 🌍 *URL:* ${fileUrl}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> 🤖 Powered by *NEXUS-AI* | Credits: pkdriller`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: ["130363288304618280@newsletter"], // Example newsletter JID
                externalAdReply: {
                    title: "NEXUS-AI File Uploader",
                    body: "Tap to open uploaded file",
                    thumbnailUrl: "https://files.catbox.moe/nzta2t.jpg", // Change thumbnail
                    sourceUrl: fileUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("Error in tourl:", err);
        reply(`❌ Error: ${err.message || err}`);
    }
});

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
          }
      
