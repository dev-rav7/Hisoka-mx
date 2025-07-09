
const { ven } = require('../hisoka');
const config = require('../settings');

// Stockage des avertissements
let warnings = {};

ven({
    pattern: 'warn',
    desc: 'Donner un avertissement à un membre',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        if (!isAdmins) return reply("❌ Seuls les admins peuvent donner des avertissements !");

        let target = quoted ? quoted.sender : (mek.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]);
        if (!target) return reply("❌ Veuillez mentionner ou répondre à un utilisateur !");

        const reason = args.join(' ') || 'Aucune raison spécifiée';

        if (!warnings[from]) warnings[from] = {};
        if (!warnings[from][target]) warnings[from][target] = [];

        const warningData = {
            warnedBy: pushname,
            reason: reason,
            timestamp: new Date().toISOString(),
            warnNumber: warnings[from][target].length + 1
        };

        warnings[from][target].push(warningData);
        const warnCount = warnings[from][target].length;
        const targetName = target.split('@')[0];

        let action = '';
        if (warnCount >= 3) {
            // Auto-kick après 3 avertissements
            if (isBotAdmins) {
                await conn.groupParticipantsUpdate(from, [target], 'remove');
                action = '\n\n🚫 *MEMBRE EXCLU AUTOMATIQUEMENT* (3 avertissements atteints)';
                delete warnings[from][target]; // Reset warnings
            }
        }

        const warnMessage = `
⚠️ *AVERTISSEMENT DONNÉ*

👤 **Utilisateur:** @${targetName}
👮 **Averti par:** ${pushname}
📝 **Raison:** ${reason}
🔢 **Avertissement:** ${warnCount}/3
🕒 **Date:** ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${warnCount === 1 ? '🟨 Premier avertissement' : 
  warnCount === 2 ? '🟧 Deuxième avertissement - Attention !' : 
  '🟥 Troisième avertissement - Exclusion automatique !'}

${action}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { 
            text: warnMessage,
            mentions: [target]
        });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de l'avertissement !");
    }
});

ven({
    pattern: 'unwarn',
    desc: 'Retirer un avertissement',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, quoted, isGroup, isAdmins, pushname, reply }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        if (!isAdmins) return reply("❌ Seuls les admins peuvent retirer des avertissements !");

        let target = quoted ? quoted.sender : (mek.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]);
        if (!target) return reply("❌ Veuillez mentionner ou répondre à un utilisateur !");

        if (!warnings[from] || !warnings[from][target] || warnings[from][target].length === 0) {
            return reply("❌ Cet utilisateur n'a aucun avertissement !");
        }

        warnings[from][target].pop(); // Retirer le dernier avertissement
        const remainingWarns = warnings[from][target].length;
        const targetName = target.split('@')[0];

        if (remainingWarns === 0) {
            delete warnings[from][target];
        }

        await conn.sendMessage(from, { 
            text: `✅ *AVERTISSEMENT RETIRÉ*\n\n@${targetName} a maintenant ${remainingWarns} avertissement(s)\n👮 **Retiré par:** ${pushname}`,
            mentions: [target]
        });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors du retrait d'avertissement !");
    }
});

ven({
    pattern: 'warnings',
    desc: 'Voir les avertissements d\'un membre',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, quoted, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");

        let target = quoted ? quoted.sender : (mek.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]);
        if (!target) return reply("❌ Veuillez mentionner ou répondre à un utilisateur !");

        if (!warnings[from] || !warnings[from][target] || warnings[from][target].length === 0) {
            return reply("❌ Cet utilisateur n'a aucun avertissement !");
        }

        const userWarnings = warnings[from][target];
        const targetName = target.split('@')[0];

        let warningsList = `
📋 *AVERTISSEMENTS DE @${targetName}*

🔢 **Total:** ${userWarnings.length}/3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

        userWarnings.forEach((warn, index) => {
            warningsList += `**${index + 1}.** ${warn.reason}\n`;
            warningsList += `   👮 Par: ${warn.warnedBy}\n`;
            warningsList += `   🕒 Le: ${new Date(warn.timestamp).toLocaleString()}\n\n`;
        });

        warningsList += `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { 
            text: warningsList,
            mentions: [target]
        });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de l'affichage des avertissements !");
    }
});
