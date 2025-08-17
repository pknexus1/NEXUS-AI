const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');
const ytSearch = require('yt-search');

cmd({
  pattern: "vid",
  alias: ["videodoch", "filmh", "mp4h"],
  react: "🎥",
  desc: "Download videos from YouTube.",
  category: "download",
  use: "<title|url>",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) return reply("😐 Please provide a video name or YouTube link.");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    let video, url;
    if (q.match(/(youtube\.com|youtu\.be)/i)) {
      url = q;
      const videoId = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      video = await ytSearch({ videoId });
    } else {
      const search = await ytSearch(q);
      if (!search || !search.videos.length) return reply("⚠️ No video found for the specified query.");
      video = search.videos[0];
      url = video.url;
    }

    const fetchApi = async (link) => {
      try {
        const res = await axios.get(link, { timeout: 10000 });
        return res.data;
      } catch {
        return { status: false };
      }
    };

    const apis = [
      `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(url)}`,
      `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(url)}`,
      `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(url)}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(url)}`
    ];

    let downloadUrl;
    for (const api of apis) {
      const data = await fetchApi(api);
      if (!data || !data.status) continue;

      // Unwrap the URL properly
      if (data.result?.url) downloadUrl = data.result.url;
      else if (data.result?.downloadUrl) downloadUrl = data.result.downloadUrl;
      else if (data.result?.data?.downloadUrl) downloadUrl = data.result.data.downloadUrl;
      else if (typeof data.result === 'string') downloadUrl = data.result;

      if (downloadUrl) break;
    }

    if (!downloadUrl || typeof downloadUrl !== "string") return reply("⚠️ Failed to retrieve a valid download URL.");

    const caption = `🎥 *${video.title}*\n\n📺 ${video.timestamp} | 👁️ ${video.views} views\n\n> 🔗 ${url}`;

    const messages = [
      {
        video: { url: downloadUrl },
        mimetype: "video/mp4",
        caption,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: "Powered by PK-TECH",
            mediaType: 1,
            sourceUrl: config.GURL || url,
            thumbnailUrl: video.thumbnail,
            renderLargerThumbnail: false
          }
        }
      },
      {
        document: { url: downloadUrl },
        mimetype: "video/mp4",
        fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp4`,
        caption: `📁 *${video.title}* (Document)`,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: "Document version - Powered by PK-TECH",
            mediaType: 1,
            sourceUrl: config.GURL || url,
            thumbnailUrl: video.thumbnail,
            renderLargerThumbnail: false
          }
        }
      }
    ];

    for (const msg of messages) {
      await conn.sendMessage(from, msg, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("Video Download Error:", err);
    reply("⚠️ Download failed due to an error: " + (err.message || err));
  }
});
