
const { ven } = require('../hisoka');
const config = require('../settings');

// Stockage des règles par groupe
let groupRules = {};

ven({
    pattern: 'setrules',
    desc: 'Définir les règles du groupe',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        if (!isAdmins) return reply("❌ Seuls les admins peuvent définir les règles !");

        const rulesText = args.join(' ');
        if (!rulesText) return reply("❌ Veuillez fournir le texte des règles !");

        groupRules[from] = {
            rules: rulesText,
            setBy: pushname,
            timestamp: new Date().toISOString()
        };

        const rulesMessage = `
📋 *RÈGLES DU GROUPE MISES À JOUR*

📌 **Groupe:** ${groupName}
👤 **Défini par:** ${pushname}
🕒 **Date:** ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${rulesText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ *Toutes les violations des règles peuvent entraîner des sanctions.*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { text: rulesMessage });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de la définition des règles !");
    }
});

ven({
    pattern: 'rules',
    desc: 'Voir les règles du groupe',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, groupName }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");

        const rules = groupRules[from];
        if (!rules) return reply("❌ Aucune règle n'a été définie pour ce groupe !");

        const rulesDisplay = `
📋 *RÈGLES DU GROUPE*

📌 **Groupe:** ${groupName}
👤 **Défini par:** ${rules.setBy}
🕒 **Date:** ${new Date(rules.timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${rules.rules}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { text: rulesDisplay });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de l'affichage des règles !");
    }
});
