
const { ven } = require('../hisoka');
const config = require('../settings');

// Système de classement des membres
ven({
    pattern: "rank",
    react: "🏆",
    desc: "Classement des membres les plus actifs du groupe",
    category: "group",
    filename: __filename,
    use: "top/me/reset"
}, async (conn, mek, m, { from, isGroup, isGroupAdmins, isOwner, args, reply }) => {
    if (!isGroup) return reply("⚠️ Cette commande ne fonctionne que dans les groupes !");

    const action = args[0]?.toLowerCase() || 'top';
    
    // Simuler une base de données d'activité (en production, utilisez une vraie DB)
    global.memberActivity = global.memberActivity || {};
    if (!global.memberActivity[from]) {
        global.memberActivity[from] = {};
    }

    switch (action) {
        case 'top':
            const topMembers = Object.entries(global.memberActivity[from])
                .sort(([,a], [,b]) => (b.messages || 0) - (a.messages || 0))
                .slice(0, 10);

            if (topMembers.length === 0) {
                return reply(`
📊 **Classement du Groupe**

ℹ️ Aucune donnée d'activité disponible pour le moment.

*Les statistiques se construisent au fur et à mesure de l'activité du groupe.*
                `);
            }

            let rankMessage = `
🏆 **TOP 10 - Membres les Plus Actifs**

`;

            const trophies = ['🥇', '🥈', '🥉', '🏅', '🎖️', '⭐', '✨', '💫', '🌟', '⚡'];
            
            topMembers.forEach(([jid, data], index) => {
                const trophy = trophies[index] || '🔸';
                const messages = data.messages || 0;
                const lastActive = data.lastActive ? new Date(data.lastActive).toLocaleDateString() : 'Jamais';
                
                rankMessage += `${trophy} **${index + 1}.** @${jid.split('@')[0]}\n`;
                rankMessage += `   📨 Messages: ${messages}\n`;
                rankMessage += `   🕒 Dernière activité: ${lastActive}\n\n`;
            });

            rankMessage += `\n💡 *Utilisez \`.rank me\` pour voir votre position*`;

            await conn.sendMessage(from, {
                text: rankMessage,
                mentions: topMembers.map(([jid]) => jid)
            }, { quoted: mek });
            break;

        case 'me':
            const userActivity = global.memberActivity[from][m.sender];
            if (!userActivity) {
                return reply(`
👤 **Votre Statistiques**

📊 **Position :** Pas encore classé
📨 **Messages :** 0
🕒 **Dernière activité :** Maintenant

*Continuez à participer pour améliorer votre classement !*
                `);
            }

            const allMembers = Object.entries(global.memberActivity[from])
                .sort(([,a], [,b]) => (b.messages || 0) - (a.messages || 0));
            
            const userRank = allMembers.findIndex(([jid]) => jid === m.sender) + 1;
            const totalMembers = allMembers.length;
            
            let medal = '';
            if (userRank === 1) medal = '🥇';
            else if (userRank === 2) medal = '🥈';
            else if (userRank === 3) medal = '🥉';
            else if (userRank <= 10) medal = '🏅';
            else medal = '📊';

            reply(`
👤 **Vos Statistiques**

${medal} **Position :** ${userRank}/${totalMembers}
📨 **Messages :** ${userActivity.messages || 0}
🕒 **Dernière activité :** ${userActivity.lastActive ? new Date(userActivity.lastActive).toLocaleDateString() : 'Maintenant'}

${userRank <= 3 ? '🎉 Félicitations ! Vous êtes sur le podium !' : 
  userRank <= 10 ? '⭐ Excellent ! Vous êtes dans le top 10 !' : 
  '💪 Continuez à participer pour améliorer votre classement !'}
            `);
            break;

        case 'reset':
            if (!isGroupAdmins && !isOwner) {
                return reply("⚠️ Seuls les admins peuvent reset les statistiques !");
            }
            
            global.memberActivity[from] = {};
            reply(`
🔄 **Statistiques Réinitialisées**

✅ Toutes les statistiques du groupe ont été remises à zéro.
👤 **Réinitialisé par :** @${m.sender.split('@')[0]}

*Le classement recommence à partir de maintenant !*
            `);
            break;

        default:
            reply(`
🏆 **Système de Classement**

📌 **Commandes disponibles :**
• \`.rank top\` - Top 10 des membres actifs
• \`.rank me\` - Voir votre position
• \`.rank reset\` - Reset les stats (admins uniquement)

📊 *Le classement se base sur l'activité des membres dans le groupe.*
            `);
    }
});

// Middleware pour tracker l'activité des membres
ven({
    on: "body"
}, async (conn, mek, m, { from, isGroup }) => {
    if (!isGroup) return;
    
    // Initialiser les données d'activité
    global.memberActivity = global.memberActivity || {};
    if (!global.memberActivity[from]) {
        global.memberActivity[from] = {};
    }
    
    // Mettre à jour l'activité du membre
    if (!global.memberActivity[from][m.sender]) {
        global.memberActivity[from][m.sender] = {
            messages: 0,
            lastActive: Date.now(),
            joinedAt: Date.now()
        };
    }
    
    global.memberActivity[from][m.sender].messages++;
    global.memberActivity[from][m.sender].lastActive = Date.now();
});
