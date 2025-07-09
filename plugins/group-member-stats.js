
const { ven } = require('../hisoka');
const { getGroupMembersMessageCount, getInactiveGroupMembers } = require('../data');
const config = require('../settings');

ven({
    pattern: 'stats',
    desc: 'Voir les statistiques des membres',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, quoted, isGroup, reply, groupName, participants }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");

        const memberStats = await getGroupMembersMessageCount(from);
        const inactiveMembers = await getInactiveGroupMembers(from);

        // Trier par nombre de messages
        const sortedStats = memberStats.sort((a, b) => b.count - a.count);
        const topMembers = sortedStats.slice(0, 10);

        let statsMessage = `
📊 *STATISTIQUES DU GROUPE*

📌 **Groupe:** ${groupName}
👥 **Total membres:** ${participants.length}
💬 **Messages totaux:** ${memberStats.reduce((sum, stat) => sum + stat.count, 0)}
😴 **Membres inactifs:** ${inactiveMembers.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 **TOP 10 MEMBRES ACTIFS:**

`;

        topMembers.forEach((member, index) => {
            const memberName = member.sender.split('@')[0];
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            statsMessage += `${emoji} @${memberName} - ${member.count} messages\n`;
        });

        statsMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (inactiveMembers.length > 0) {
            statsMessage += `😴 **MEMBRES INACTIFS (${inactiveMembers.length}):**\n`;
            inactiveMembers.slice(0, 5).forEach(member => {
                const memberName = member.split('@')[0];
                statsMessage += `• @${memberName}\n`;
            });
            if (inactiveMembers.length > 5) {
                statsMessage += `... et ${inactiveMembers.length - 5} autres\n`;
            }
        }

        statsMessage += `\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { 
            text: statsMessage,
            mentions: [...topMembers.map(m => m.sender), ...inactiveMembers.slice(0, 5)]
        });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de l'affichage des statistiques !");
    }
});

ven({
    pattern: 'mystats',
    desc: 'Voir ses propres statistiques',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply, groupName, pushname }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");

        const memberStats = await getGroupMembersMessageCount(from);
        const userStats = memberStats.find(stat => stat.sender === sender);

        if (!userStats) {
            return reply("❌ Aucune statistique trouvée pour vous !");
        }

        // Calculer le rang
        const sortedStats = memberStats.sort((a, b) => b.count - a.count);
        const userRank = sortedStats.findIndex(stat => stat.sender === sender) + 1;
        const totalMembers = memberStats.length;
        const percentage = ((userStats.count / memberStats.reduce((sum, stat) => sum + stat.count, 0)) * 100).toFixed(1);

        const myStatsMessage = `
📊 *VOS STATISTIQUES*

📌 **Groupe:** ${groupName}
👤 **Utilisateur:** ${pushname}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 **Messages envoyés:** ${userStats.count}
🏆 **Rang:** ${userRank}/${totalMembers}
📈 **Pourcentage d'activité:** ${percentage}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${userRank <= 3 ? '🔥 Vous êtes dans le top 3 !' : 
  userRank <= 10 ? '⭐ Vous êtes dans le top 10 !' : 
  userRank <= totalMembers/2 ? '👍 Vous êtes dans la moyenne !' : 
  '😴 Vous pourriez être plus actif !'}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { text: myStatsMessage });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de l'affichage de vos statistiques !");
    }
});

ven({
    pattern: 'inactive',
    desc: 'Voir les membres inactifs',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, reply, groupName }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        if (!isAdmins) return reply("❌ Seuls les admins peuvent voir cette liste !");

        const inactiveMembers = await getInactiveGroupMembers(from);

        if (inactiveMembers.length === 0) {
            return reply("✅ Tous les membres sont actifs !");
        }

        let inactiveMessage = `
😴 *MEMBRES INACTIFS*

📌 **Groupe:** ${groupName}
👥 **Membres inactifs:** ${inactiveMembers.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

        inactiveMembers.forEach((member, index) => {
            const memberName = member.split('@')[0];
            inactiveMessage += `${index + 1}. @${memberName}\n`;
        });

        inactiveMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ *Ces membres n'ont envoyé aucun message depuis le démarrage du bot.*\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { 
            text: inactiveMessage,
            mentions: inactiveMembers
        });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de l'affichage des membres inactifs !");
    }
});
