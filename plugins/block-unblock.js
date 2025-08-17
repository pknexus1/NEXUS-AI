const { cmd } = require('../command');

async function handleBlockAction(conn, m, { reply, q, react }, action) {
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (m.sender !== botOwner) {
        await react("❌");
        return reply("⚠️ *Only the bot owner can use this command.*");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender;
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0];
    } else if (q && q.includes("@")) {
        jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
    } else {
        await react("❌");
        return reply("📌 *Please mention a user or reply to their message.*");
    }

    try {
        await conn.updateBlockStatus(jid, action);
        await react("✅");

        const statusText =
            action === "block"
                ? `🚫 Successfully *blocked* @${jid.split("@")[0]}`
                : `🔓 Successfully *unblocked* @${jid.split("@")[0]}`;

        await conn.sendMessage(
            m.chat,
            {
                text: statusText,
                mentions: [jid],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363288304618280@newsletter",
                        newsletterName: "pk-tech",
                        serverMessageId: 143,
                    },
                },
            },
            { quoted: m }
        );
    } catch (error) {
        console.error(`${action} command error:`, error);
        await react("❌");
        reply(`❌ Failed to ${action} the user.`);
    }
}

cmd(
    {
        pattern: "block",
        desc: "Blocks a person",
        category: "owner",
        react: "🚫",
        filename: __filename,
    },
    async (conn, m, extras) => handleBlockAction(conn, m, extras, "block")
);

cmd(
    {
        pattern: "unblock",
        desc: "Unblocks a person",
        category: "owner",
        react: "🔓",
        filename: __filename,
    },
    async (conn, m, extras) => handleBlockAction(conn, m, extras, "unblock")
);
