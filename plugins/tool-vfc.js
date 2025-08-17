const fs = require('fs');
const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
    pattern: 'savecontact',
    alias: ["vcf", "scontact", "savecontacts"],
    desc: 'Save all group contacts as a VCF file.',
    category: 'tools',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, groupMetadata, reply }) => {
    try {
        // Allow only in groups
        if (!isGroup) return reply("❌ This command works only in *groups*.");
        
        // Allow only the owner
        if (!isOwner) return reply("🔒 This command is for the *Bot Owner* only.");

        const { participants, subject } = groupMetadata;

        // Prepare VCF content
        let vcardContent = '';
        let index = 1;
        for (let member of participants) {
            let number = member.id.split("@")[0];
            vcardContent += `BEGIN:VCARD\nVERSION:3.0\nFN:[${index++}] +${number}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD\n`;
        }

        // Save file
        const filePath = './contacts.vcf';
        fs.writeFileSync(filePath, vcardContent.trim());

        reply(`📦 Saving *${participants.length}* contacts from group: *${subject}*`);
        await sleep(1500);

        // Send file
        await conn.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'text/vcard',
            fileName: 'NEXUS_AI_Contacts.vcf',
            caption: `✅ Successfully saved *${participants.length}* contacts from group: *${subject}*\n\n> 🤖 Powered by *NEXUS-AI* | Credits: pkdriller`
        }, { quoted: mek });

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (err) {
        console.error("Error in savecontact:", err);
        reply(`❌ Error: ${err.message}`);
    }
});
