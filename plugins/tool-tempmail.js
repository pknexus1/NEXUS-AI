const axios = require('axios');
const { cmd } = require('../command');

// Generate Temporary Email
cmd({
    pattern: "tempmail",
    alias: ["genmail"],
    desc: "Generate a new temporary email address",
    category: "utility",
    react: "📧",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const res = await axios.get('https://apis.davidcyriltech.my.id/temp-mail');
        const { email, session_id, expires_at } = res.data;

        const expiresDate = new Date(expires_at);
        const timeString = expiresDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateString = expiresDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

        const msg = `
╭───〔 *📧 TEMPORARY EMAIL GENERATED* 〕───⊷
│ ✉️ *Email:* ${email}
│ ⏳ *Expires:* ${timeString} • ${dateString}
│ 🔑 *Session ID:* \`\`\`${session_id}\`\`\`
│ 📥 *Check Inbox:* .inbox ${session_id}
╰───────────────────────────────⊷
_Email will expire after 24 hours_
        `;

        await conn.sendMessage(
            from,
            { 
                text: msg,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    mentionedJid: ["130363288304618280@newsletter"]
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error('TempMail error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Check Inbox
cmd({
    pattern: "checkmail",
    alias: ["inbox", "tmail", "mailinbox"],
    desc: "Check your temporary email inbox",
    category: "utility",
    react: "📬",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const sessionId = args[0];
        if (!sessionId) return reply('🔑 Please provide your session ID\nExample: .checkmail YOUR_SESSION_ID');

        const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(sessionId)}`;
        const res = await axios.get(inboxUrl);

        if (!res.data.success) return reply('❌ Invalid session ID or expired email');

        const { inbox_count, messages } = res.data;
        if (inbox_count === 0) return reply('📭 Your inbox is empty');

        let inboxMsg = `📬 *You have ${inbox_count} message(s)*\n\n`;
        messages.forEach((msg, i) => {
            inboxMsg += `━━━━━━━━━━━━━━━━━━\n` +
                        `📌 *Message ${i + 1}*\n` +
                        `👤 *From:* ${msg.from}\n` +
                        `📝 *Subject:* ${msg.subject}\n` +
                        `⏰ *Date:* ${new Date(msg.date).toLocaleString()}\n\n` +
                        `📄 *Content:*\n${msg.body}\n\n`;
        });

        await conn.sendMessage(
            from,
            { 
                text: inboxMsg,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    mentionedJid: ["130363288304618280@newsletter"]
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error('CheckMail error:', e);
        reply(`❌ Error checking inbox: ${e.response?.data?.message || e.message}`);
    }
});
