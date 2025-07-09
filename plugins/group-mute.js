
const { ven } = require('../hisoka');
const config = require('../settings');

// Stockage des utilisateurs mutés
let mutedUsers = {};

ven({
    pattern: 'mute',
    desc: 'Muter un membre du groupe',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        if (!isAdmins) return reply("❌ Seuls les admins peuvent muter des membres !");
        if (!isBotAdmins) return reply("❌ Le bot doit être admin pour muter !");

        let target = quoted ? quoted.sender : (mek.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]);
        if (!target) return reply("❌ Veuillez mentionner ou répondre à un utilisateur !");

        const duration = args[0] || '60'; // durée en minutes
        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        if (!mutedUsers[from]) mutedUsers[from] = {};
        
        const muteEndTime = Date.now() + (parseInt(duration) * 60 * 1000);
        mutedUsers[from][target] = {
            mutedBy: pushname,
            reason: reason,
            startTime: Date.now(),
            endTime: muteEndTime,
            duration: parseInt(duration)
        };

        const targetName = target.split('@')[0];
        const muteMessage = `
🔇 *MEMBRE MUTÉ*

👤 **Utilisateur:** @${targetName}
👮 **Muté par:** ${pushname}
⏰ **Durée:** ${duration} minutes
📝 **Raison:** ${reason}
🕒 **Fin du mute:** ${new Date(muteEndTime).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ *Cet utilisateur ne peut plus envoyer de messages temporairement.*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { 
            text: muteMessage,
            mentions: [target]
        });

        // Auto-unmute après la durée
        setTimeout(() => {
            if (mutedUsers[from] && mutedUsers[from][target]) {
                delete mutedUsers[from][target];
                conn.sendMessage(from, { 
                    text: `🔊 *AUTO-UNMUTE*\n\n@${targetName} peut maintenant parler à nouveau !`,
                    mentions: [target]
                });
            }
        }, parseInt(duration) * 60 * 1000);
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors du mute !");
    }
});

ven({
    pattern: 'unmute',
    desc: 'Démuter un membre du groupe',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, quoted, isGroup, isAdmins, isBotAdmins, pushname, reply }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        if (!isAdmins) return reply("❌ Seuls les admins peuvent démuter des membres !");

        let target = quoted ? quoted.sender : (mek.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]);
        if (!target) return reply("❌ Veuillez mentionner ou répondre à un utilisateur !");

        if (!mutedUsers[from] || !mutedUsers[from][target]) {
            return reply("❌ Cet utilisateur n'est pas muté !");
        }

        delete mutedUsers[from][target];
        const targetName = target.split('@')[0];

        await conn.sendMessage(from, { 
            text: `🔊 *MEMBRE DÉMUTÉ*\n\n@${targetName} peut maintenant parler à nouveau !\n👮 **Démuté par:** ${pushname}`,
            mentions: [target]
        });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors du démute !");
    }
});

// Intercepter les messages pour bloquer les utilisateurs mutés
ven({
    on: "body"
}, async (conn, mek, m, { from, sender, isGroup, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup || isAdmins || sender === conn.user?.id) return;
        
        if (mutedUsers[from] && mutedUsers[from][sender]) {
            const muteInfo = mutedUsers[from][sender];
            
            // Vérifier si le mute a expiré
            if (Date.now() > muteInfo.endTime) {
                delete mutedUsers[from][sender];
                return;
            }

            // Supprimer le message
            await conn.sendMessage(from, { delete: mek.key });
            
            const remainingTime = Math.ceil((muteInfo.endTime - Date.now()) / (60 * 1000));
            await conn.sendMessage(from, {
                text: `🔇 @${sender.split('@')[0]} vous êtes muté encore pour ${remainingTime} minutes !`,
                mentions: [sender]
            });
        }
    } catch (err) {
        console.error(err);
    }
});
