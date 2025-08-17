const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');
const ytSearch = require('yt-search');

cmd({
  pattern: "play",
  alias: ["song", "playdoc", "wimbo", "mp3"],
  react: "🎸",
  desc: "Download audio from YouTube.",
  category: "search",
  use: "<title|url>",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) return reply("😐 Please provide an audio name or YouTube link.");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    let video, url;
    if (q.match(/(youtube\.com|youtu\.be)/i)) {
      url = q;
      const videoId = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      video = await ytSearch({ videoId });
    } else {
      const search = await ytSearch(q);
      if (!search || !search.videos.length) return reply("⚠️ No audio found for the specified query.");
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
      `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`,
      `https://apis-keith.vercel.app/download/mp3?url=${encodeURIComponent(url)}`,
      `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(url)}`,
      `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(url)}`
    ];

    let downloadUrl;
    for (const api of apis) {
      const data = await fetchApi(api);
      if (data && data.status) {
        if (api.includes("ytmp3")) downloadUrl = data.result.url;
        else if (api.includes("mp3")) downloadUrl = data.result.downloadUrl;
        else if (api.includes("dlmp3")) downloadUrl = data.result.data.downloadUrl;
        else if (api.includes("audio")) downloadUrl = data.result;
        if (downloadUrl) break;
      }
    }

    if (!downloadUrl) return reply("⚠️ Failed to retrieve download URL. Try again later.");

    const caption = `🎶 *${video.title}*\n\n📺 ${video.timestamp} | 👁️ ${video.views} views\n\n> 🔗 ${url}`;

    const messages = [
      {
        audio: { url: downloadUrl },
        mimetype: "audio/mpeg",
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: "Powered by Lucky AI",
            mediaType: 1,
            sourceUrl: config.GURL || url,
            thumbnailUrl: video.thumbnail,
            renderLargerThumbnail: false
          }
        }
      },
      {
        document: { url: downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
        caption,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: "Document version - Powered by Lucky AI",
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
    console.error("Error:", err);
    reply("⚠️ Download failed due to an error: " + (err.message || err));
  }
});
