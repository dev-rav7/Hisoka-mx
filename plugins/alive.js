const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const caption = `
█▓▒▒〔 🕶️ *${config.BOT_NAME}* 〕▒▒▓█
█ ⚡ *En ligne & opérationnel*
█ 👑 *Owner:* ${config.OWNER_NAME}
█ 🔖 *Version:* ${config.version}
█ 🛠️ *Préfixe:* ${config.PREFIX}
█ ⚙️ *Mode:* ${config.MODE}
█ 💾 *RAM:* ${heapUsed}MB / ${totalMem}MB
█ 🖥️ *Hôte:* ${os.hostname()}
█ ⏱️ *Uptime:* ${uptime}
█████████████████████████████
📝 *${config.DESCRIPTION}*
`.trim();

await conn.sendMessage(from, {
    image: { url: config.MENU_IMAGE_URL },
    caption,
    contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 1000,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363400575205721@newsletter',
            newsletterName: '𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗',
            serverMessageId: 143
        }
    }
}, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

