const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "tagadmins",
    react: "👑",
    alias: ["adminstag"],
    desc: "Tag all group admins",
    category: "group",
    use: '.tagadmins [message]',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins, prefix, command, args, body, sender }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const botOwner = conn.user.id.split(":")[0]; // Bot owner's number
        const senderJid = senderNumber + "@s.whatsapp.net";

        if (!groupAdmins.includes(senderJid) && senderNumber !== botOwner) {
            return reply("❌ Only group admins or the bot owner can use this command.");
        }

        // Fetch group metadata
        let groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) return reply("❌ Failed to fetch group information.");

        let groupName = groupInfo.subject || "Unknown Group";
        let adminParticipants = participants.filter(p => groupAdmins.includes(p.id));
        if (!adminParticipants.length) return reply("⚠️ No admins found in this group.");

        let emojis = ['👑', '⭐', '⚡', '💥', '🎯', '🛡️', '🔥', '💫', '🎉', '✨'];
        let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "Attention Admins"; // Default message

        let teks = `▢ Group : *${groupName}*\n▢ Admins : *${adminParticipants.length}*\n▢ Message: *${message}*\n\n┌───⊷ *ADMINS MENTIONS*\n`;

        for (let admin of adminParticipants) {
            if (!admin.id) continue;
            teks += `${randomEmoji} @${admin.id.split('@')[0]}\n`;
        }

        teks += "└──✪ NEXUS ┃ AI ✪──";

        await conn.sendMessage(from, { 
            text: teks, 
            mentions: adminParticipants.map(a => a.id),
            contextInfo: {
                mentionedJid: adminParticipants.map(a => a.id),
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    serverMessageId: 1
                },
                externalAdReply: {
                    title: `👑 Admin Tagging`,
                    body: `NEXUS-AI • Tagged ${adminParticipants.length} admins`,
                    thumbnailUrl: "https://files.catbox.moe/qoupjv.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vad7YNyJuyA77CtIPX0x"
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("TagAdmins Error:", e);
        reply(`❌ *Error Occurred !!*\n\n${e.message || e}`);
    }
});
