const fs = require("fs");
const config = require("../config");
const { cmd, commands } = require("../command");
const path = require('path');
const axios = require("axios");

cmd({
    pattern: "privacy",
    alias: ["privacymenu"],
    desc: "Privacy settings menu",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let privacyMenu = `╭━━〔 *Privacy Settings* 〕━━┈⊷
┃◈┃• blocklist - View blocked users
┃◈┃• getbio - Get user's bio
┃◈┃• setppall - Set profile pic privacy
┃◈┃• setonline - Set online privacy
┃◈┃• setpp - Change bot's profile pic
┃◈┃• setmyname - Change bot's name
┃◈┃• updatebio - Change bot's bio
┃◈┃• groupsprivacy - Set group add privacy
┃◈┃• getprivacy - View current privacy settings
┃◈┃• getpp - Get user's profile picture
┃◈└───────────┈⊷
*Note:* Most commands are owner-only`;

        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/7zfdcq.jpg` },
            caption: privacyMenu,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});

cmd({
    pattern: "blocklist",
    desc: "View blocked users.",
    category: "privacy",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("*📛 You are not the owner!*");
    try {
        const blockedUsers = await conn.fetchBlocklist();
        if (!blockedUsers.length) return reply("📋 Your block list is empty.");

        const list = blockedUsers.map(user => `🚧 BLOCKED ${user.split('@')[0]}`).join('\n');
        reply(`📋 Blocked Users (${blockedUsers.length}):\n\n${list}`);
    } catch (err) {
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});

cmd({
    pattern: "getbio",
    desc: "Displays the user's bio.",
    category: "privacy",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        const jid = args[0] || mek.key.remoteJid;
        const about = await conn.fetchStatus?.(jid);
        if (!about) return reply("No bio found.");
        return reply(`User Bio:\n\n${about.status}`);
    } catch {
        reply("No bio found.");
    }
});

cmd({
    pattern: "setppall",
    desc: "Update Profile Picture Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    const value = args[0] || 'all';
    const valid = ['all', 'contacts', 'contact_blacklist', 'none'];
    if (!valid.includes(value)) return reply("❌ Invalid option.");
    await conn.updateProfilePicturePrivacy(value);
    reply(`✅ Profile picture privacy updated to: ${value}`);
});

cmd({
    pattern: "setonline",
    desc: "Update Online Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    const value = args[0] || 'all';
    const valid = ['all', 'match_last_seen'];
    if (!valid.includes(value)) return reply("❌ Invalid option.");
    await conn.updateOnlinePrivacy(value);
    reply(`✅ Online privacy updated to: ${value}`);
});

cmd({
    pattern: "setpp",
    desc: "Set bot profile picture.",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { quoted, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted?.message?.imageMessage) return reply("❌ Reply to an image.");
    const stream = await downloadContentFromMessage(quoted.message.imageMessage, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    const mediaPath = path.join(__dirname, `${Date.now()}.jpg`);
    fs.writeFileSync(mediaPath, buffer);
    await conn.updateProfilePicture(conn.user.jid, { url: `file://${mediaPath}` });
    reply("🖼️ Profile picture updated!");
});

cmd({
    pattern: "updatebio",
    react: "🥏",
    desc: "Change the Bot number Bio.",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { q, isOwner, reply, from }) => {
    if (!isOwner) return reply('🚫 Owner only');
    if (!q) return reply('❓ Enter the New Bio');
    if (q.length > 139) return reply('❗ Character limit exceeded');
    await conn.updateProfileStatus(q);
    await conn.sendMessage(from, {
        text: "✔️ New Bio Added Successfully",
        contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true }
    }, { quoted: mek });
});

cmd({
    pattern: "getprivacy",
    desc: "Get bot privacy settings.",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { isOwner, reply, from }) => {
    if (!isOwner) return reply('🚫 Owner only');
    const duka = await conn.fetchPrivacySettings?.(true);
    if (!duka) return reply('🚫 Failed to fetch privacy settings');
    let puka = `
╭───「 PRIVACY 」───◆  
│ ∘ Read Receipts: ${duka.readreceipts}  
│ ∘ Profile Picture: ${duka.profile}  
│ ∘ Status: ${duka.status}  
│ ∘ Online: ${duka.online}  
│ ∘ Last Seen: ${duka.last}  
│ ∘ Group Privacy: ${duka.groupadd}  
│ ∘ Call Privacy: ${duka.calladd}  
╰────────────────────`;
    await conn.sendMessage(from, {
        text: puka,
        contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true }
    }, { quoted: mek });
});

cmd({
    pattern: "getdp",
    desc: "Fetch profile picture of a user.",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { quoted, sender, reply, from }) => {
    const targetJid = quoted ? quoted.sender : sender;
    if (!targetJid) return reply("⚠️ Reply to a user");
    const userPicUrl = await conn.profilePictureUrl(targetJid, "image").catch(() => null);
    if (!userPicUrl) return reply("⚠️ No profile picture found.");
    await conn.sendMessage(from, {
        image: { url: userPicUrl },
        caption: "🖼️ Profile picture:",
        contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true }
    }, { quoted: mek });
});
            
