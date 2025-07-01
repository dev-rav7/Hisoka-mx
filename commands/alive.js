const settings = require("../settings");
async function aliveCommand(sock, chatId, message) {
    try {
        const botMode = settings.mode === "public" ? "Public" : 
                settings.mode === "private" ? "Privé" : 
                "Inconnu";

const message1 = 
`╔═════🎭 *『𝙒𝘼・𝙃𝙄𝙎・𝙑𝟭』 EST EN SCÈNE* 🎭═════╗\n` +
`║ 🧬 *Version :* ${settings.version}\n` +
`║ 📡 *Statut   :* En ligne\n` +
`║ 🎮 *Mode     :* ${settings.commandMode}\n` +
`╠═════════════════════════════════╣\n` +
`║ 🌟 *Fonctionnalités :*\n` +
`║ • Gestion des Royaumes 👑\n` +
`║ • Protection Anti-Lien 🔗\n` +
`║ • Commandes Fun & Otaku 🎌\n` +
`║ • Et bien plus encore... 💫\n` +
`╚═════════════════════════════════╝\n\n` +
`🃏 *Tape *menu* pour dévoiler le grimoire des illusions.*`;
        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,=
                forwardedNewsletterMessageInfo: {
                    newsletterJid: 'null@newsletter',
                    newsletterName: 'null',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: 'Bot is alive and running!' }, { quoted: message });
    }
}

module.exports = aliveCommand;