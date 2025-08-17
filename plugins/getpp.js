const { cmd } = require("../command");

cmd({
  pattern: "getpp",
  alias: [],
  use: "pp",
  desc: "Get profile picture of a user (replied user in group, or DM user)",
  category: "tools",
  react: "🖼️",
  filename: __filename
},
async (conn, mek, m, { from, sender, reply, isGroup }) => {
  try {
    const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.participant;
    const quotedKey = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let targetJid;

    if (isGroup) {
      // In group: must reply to get a target
      if (quotedMsg && quotedKey) {
        targetJid = quotedMsg;
      } else {
        return reply("❌ Please reply to someone's message to get their profile picture.");
      }
    } else {
      // In DM: use the other user you're chatting with
      targetJid = from.endsWith("@s.whatsapp.net") ? from : sender;
    }

    // Attempt to get profile picture
    let imageUrl;
    try {
      imageUrl = await conn.profilePictureUrl(targetJid, 'image');
    } catch {
      imageUrl = "https://files.catbox.moe/ntqtnt.jpg"; // fallback image
    }

    // Send profile picture
    await conn.sendMessage(from, {
      image: { url: imageUrl },
      caption: `🖼️ Profile Picture of @${targetJid.split('@')[0]}`,
      contextInfo: {
        mentionedJid: [targetJid],
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "NEXUS-AI",
          newsletterJid: "120363288304618280@newsletter"
        }
      }
    }, { quoted: mek });

  } catch (err) {
    console.error("Error in getpp:", err);
    reply("❌ Failed to fetch profile picture.");
  }
});
