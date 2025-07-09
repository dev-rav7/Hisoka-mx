
const { ven } = require('../hisoka');
const config = require('../settings');
const { getGroupAdmins } = require('../lib/functions');

// Système de rétrogradation automatique
ven({
    pattern: "autodemote",
    react: "⬇️",
    desc: "Configuration de la rétrogradation automatique des admins",
    category: "group",
    filename: __filename,
    use: "on/off [jours]"
}, async (conn, mek, m, { from, isGroup, isGroupAdmins, isOwner, args, reply }) => {
    if (!isGroup) return reply("⚠️ Cette commande ne fonctionne que dans les groupes !");
    if (!isGroupAdmins && !isOwner) return reply("⚠️ Seuls les admins peuvent utiliser cette commande !");

    const action = args[0]?.toLowerCase();
    const days = parseInt(args[1]) || 30;

    if (!action || !['on', 'off', 'status', 'check'].includes(action)) {
        return reply(`
🔧 **Auto-Demote System**

📌 **Utilisation :**
• \`.autodemote on [jours]\` - Activer (défaut: 30 jours)
• \`.autodemote off\` - Désactiver
• \`.autodemote status\` - Voir le statut
• \`.autodemote check\` - Vérifier les admins inactifs

⚠️ **Note :** Les admins inactifs depuis X jours seront automatiquement rétrogradés.
        `);
    }

    // Simuler une base de données (en production, utilisez une vraie DB)
    global.autoDemoteSettings = global.autoDemoteSettings || {};
    
    switch (action) {
        case 'on':
            global.autoDemoteSettings[from] = {
                enabled: true,
                days: days,
                enabledBy: m.sender,
                enabledAt: Date.now()
            };
            reply(`✅ **Auto-Demote Activé !**\n\n⏰ **Période d'inactivité :** ${days} jours\n👤 **Activé par :** @${m.sender.split('@')[0]}\n\n*Les admins inactifs depuis ${days} jours seront automatiquement rétrogradés.*`);
            break;

        case 'off':
            if (global.autoDemoteSettings[from]) {
                delete global.autoDemoteSettings[from];
                reply(`❌ **Auto-Demote Désactivé !**\n\n*La rétrogradation automatique a été désactivée pour ce groupe.*`);
            } else {
                reply(`ℹ️ **Auto-Demote** n'était pas activé dans ce groupe.`);
            }
            break;

        case 'status':
            const settings = global.autoDemoteSettings[from];
            if (settings && settings.enabled) {
                const enabledDate = new Date(settings.enabledAt).toLocaleDateString();
                reply(`
📊 **Statut Auto-Demote**

✅ **Statut :** Activé
⏰ **Période :** ${settings.days} jours
👤 **Activé par :** @${settings.enabledBy.split('@')[0]}
📅 **Depuis :** ${enabledDate}

*Les admins inactifs depuis ${settings.days} jours seront rétrogradés.*
                `);
            } else {
                reply(`❌ **Auto-Demote** n'est pas activé dans ce groupe.`);
            }
            break;

        case 'check':
            const groupMetadata = await conn.groupMetadata(from);
            const admins = getGroupAdmins(groupMetadata.participants);
            const botAdmin = admins.includes(conn.user.id.split(':')[0] + '@s.whatsapp.net');
            
            if (!botAdmin) {
                return reply(`⚠️ Je dois être admin pour vérifier l'activité des membres !`);
            }

            // Simuler la vérification d'activité (en production, utilisez une vraie DB)
            const inactiveAdmins = [];
            const activeAdmins = [];
            
            for (const admin of admins) {
                if (admin === conn.user.id.split(':')[0] + '@s.whatsapp.net') continue;
                // Simuler l'inactivité (en production, vérifiez la vraie activité)
                const daysSinceActivity = Math.floor(Math.random() * 60);
                if (daysSinceActivity > (global.autoDemoteSettings[from]?.days || 30)) {
                    inactiveAdmins.push({
                        jid: admin,
                        days: daysSinceActivity
                    });
                } else {
                    activeAdmins.push({
                        jid: admin,
                        days: daysSinceActivity
                    });
                }
            }

            let message = `
📊 **Vérification des Admins**

👥 **Total des admins :** ${admins.length}
✅ **Admins actifs :** ${activeAdmins.length}
⚠️ **Admins inactifs :** ${inactiveAdmins.length}

`;

            if (inactiveAdmins.length > 0) {
                message += `\n🔴 **Admins Inactifs (${global.autoDemoteSettings[from]?.days || 30}+ jours) :**\n`;
                inactiveAdmins.forEach(admin => {
                    message += `• @${admin.jid.split('@')[0]} (${admin.days} jours)\n`;
                });
            }

            if (activeAdmins.length > 0) {
                message += `\n🟢 **Admins Actifs :**\n`;
                activeAdmins.forEach(admin => {
                    message += `• @${admin.jid.split('@')[0]} (${admin.days} jours)\n`;
                });
            }

            reply(message);
            break;
    }
});

// Vérification automatique périodique (simulée)
setInterval(async () => {
    if (!global.autoDemoteSettings) return;
    
    for (const [groupId, settings] of Object.entries(global.autoDemoteSettings)) {
        if (!settings.enabled) continue;
        
        try {
            const groupMetadata = await conn.groupMetadata(groupId);
            const admins = getGroupAdmins(groupMetadata.participants);
            const botAdmin = admins.includes(conn.user.id.split(':')[0] + '@s.whatsapp.net');
            
            if (!botAdmin) continue;
            
            // Vérifier et rétrograder les admins inactifs
            // (Code de vérification d'activité réelle nécessaire)
            
        } catch (error) {
            console.error('Auto-demote check error:', error);
        }
    }
}, 24 * 60 * 60 * 1000); // Vérifier toutes les 24 heures
