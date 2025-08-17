const { cmd } = require('../command');

// Anti-tag status per group
let antiTagGroups = {};

cmd({
    pattern: "antitag",
    react: "⚠️",
    alias: ["antimtag"],
    desc: "Enable or disable anti-tag for the bot in a group",
    category: "group",
    use: ".antitag on/off",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, args, senderNumber, groupAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        const botOwner = conn.user.id.split(":")[0];
        const senderJid = senderNumber + "@s.whatsapp.net";

        if (!groupAdmins.includes(senderJid) && senderNumber !== botOwner) {
            return reply("❌ Only group admins or the bot owner can use this command.");
        }

        if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
            return reply("⚠️ Usage: .antitag on/off");
        }

        antiTagGroups[from] = args[0].toLowerCase() === "on";
        reply(`✅ Anti-Tag for the bot is now *${args[0].toUpperCase()}* in this group.`);

    } catch (e) {
        console.error("AntiTag Command Error:", e);
        reply("❌ Failed to toggle Anti-Tag.");
    }
});

// Listener for all messages in group
cmd({
    pattern: ".*", // catch all messages
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, participants }) => {
    try {
        if (!isGroup) return;
        if (!antiTagGroups[m.chat]) return; // Anti-tag off

        const botJid = conn.user.id;
        const mentions = m.mentionedJid || [];
        const isBotTagged = mentions.includes(botJid);
        const isEveryoneTagged = mentions.length >= participants.length - 1; // tagall detection

        if (isBotTagged || isEveryoneTagged) {
            // Delete the message
            await conn.sendMessage(m.chat, { delete: m.key });

            // Remove the sender from group
            await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");

            // Send warning to the user
            await conn.sendMessage(m.chat, {
                text: `⚠️ @${m.sender.split("@")[0]}, tagging the bot or all members is not allowed! You have been removed.`,
                mentions: [m.sender],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363288304618280@newsletter',
                        serverMessageId: 1
                    }
                }
            });
        }

    } catch (err) {
        console.error("AntiTag Listener Error:", err);
    }
});
