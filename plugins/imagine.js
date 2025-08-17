const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "fluxai",
  alias: ["flux", "imagine"],
  react: "🚀",
  desc: "Generate an image using Flux AI",
  category: "ai",
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide an image prompt");

    await reply("> *Generating Flux AI Image...* ✨");

    const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response?.data) return reply("❌ Image generation failed");

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data, "binary"),
      caption: `🖼️ *Flux AI Image Generated*\n\n✨ *Prompt:* ${q}\n\n⚡ *Powered by NEXUS-AI*\n🌟 *PK-TECH Development*`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363288304618280@newsletter',
          newsletterName: "pk-tech",
          serverMessageId: 175
        }
      }
    });

  } catch (error) {
    console.error("FluxAI Error:", error);
    reply(`❌ Error: ${error.response?.data?.message || error.message || "Failed to generate image"}`);
  }
});

cmd({
  pattern: "stablediffusion",
  alias: ["sdiffusion", "imagine2"],
  react: "🎨", 
  desc: "Generate image using Stable Diffusion",
  category: "ai",
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide an image prompt");

    await reply("> *Generating Stable Diffusion Image...* 🖌️");

    const apiUrl = `https://api.siputzx.my.id/api/ai/stable-diffusion?prompt=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response?.data) return reply("❌ Image generation failed");

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data, "binary"),
      caption: `🎨 *Stable Diffusion Art*\n\n✨ *Prompt:* ${q}\n\n⚡ *Powered by NEXUS-AI*\n🌟 *PK-TECH Development*`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363288304618280@newsletter',
          newsletterName: "pk-tech",
          serverMessageId: 176
        }
      }
    });

  } catch (error) {
    console.error("StableDiffusion Error:", error);
    reply(`❌ Error: ${error.response?.data?.message || error.message || "Failed to generate image"}`);
  }
});

cmd({
  pattern: "stabilityai", 
  alias: ["stability", "imagine3"],
  react: "🤖",
  desc: "Generate image using Stability AI",
  category: "ai",
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide an image prompt");

    await reply("> *Generating Stability AI Image...* 🎭");

    const apiUrl = `https://api.siputzx.my.id/api/ai/stabilityai?prompt=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response?.data) return reply("❌ Image generation failed");

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data, "binary"),
      caption: `🤖 *Stability AI Creation*\n\n✨ *Prompt:* ${q}\n\n⚡ *Powered by NEXUS-AI*\n🌟 *PK-TECH Development*`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363288304618280@newsletter',
          newsletterName: "pk-tech",
          serverMessageId: 177
        }
      }
    });

  } catch (error) {
    console.error("StabilityAI Error:", error);
    reply(`❌ Error: ${error.response?.data?.message || error.message || "Failed to generate image"}`);
  }
});
