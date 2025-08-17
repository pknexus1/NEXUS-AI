const { cmd } = require('../command');
const axios = require('axios');

// Shared function to send AI reply with contextInfo
async function sendAIReply(conn, m, text) {
    await conn.sendMessage(m.chat, {
        text,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363288304618280@newsletter", // your channel JID
                newsletterName: "PK-XMD CHANNEL",
                serverMessageId: -1
            }
        }
    }, { quoted: m });
}

// General AI (Lance-Frank API)
cmd({
    pattern: "ai",
    alias: ["bot", "dj", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { q, react }) => {
    try {
        if (!q) return sendAIReply(conn, m, "Please provide a message for the AI.\nExample: `.ai Hello`");

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return sendAIReply(conn, m, "AI failed to respond. Please try again later.");
        }

        await sendAIReply(conn, m, `🤖 *AI Response:*\n\n${data.message}`);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        sendAIReply(conn, m, "An error occurred while communicating with the AI.");
    }
});

// OpenAI
cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { q, react }) => {
    try {
        if (!q) return sendAIReply(conn, m, "Please provide a message for OpenAI.\nExample: `.openai Hello`");

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return sendAIReply(conn, m, "OpenAI failed to respond. Please try again later.");
        }

        await sendAIReply(conn, m, `🧠 *OpenAI Response:*\n\n${data.result}`);
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        sendAIReply(conn, m, "An error occurred while communicating with OpenAI.");
    }
});

// DeepSeek
cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { q, react }) => {
    try {
        if (!q) return sendAIReply(conn, m, "Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return sendAIReply(conn, m, "DeepSeek AI failed to respond. Please try again later.");
        }

        await sendAIReply(conn, m, `🧠 *DeepSeek AI Response:*\n\n${data.answer}`);
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek command:", e);
        await react("❌");
        sendAIReply(conn, m, "An error occurred while communicating with DeepSeek AI.");
    }
});
            
