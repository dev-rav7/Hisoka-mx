
const { ven } = require('../hisoka');
const config = require('../settings');

// Gestionnaire de paramètres de groupe
ven({
    pattern: "groupsettings",
    react: "⚙️",
    desc: "Interface de gestion des paramètres du groupe",
    category: "group",
    filename: __filename,
    use: "view/edit/reset"
}, async (conn, mek, m, { from, isGroup, isGroupAdmins, isOwner, args, reply }) => {
    if (!isGroup) return reply("⚠️ Cette commande ne fonctionne que dans les groupes !");
    if (!isGroupAdmins && !isOwner) return reply("⚠️ Seuls les admins peuvent utiliser cette commande !");

    const action = args[0]?.toLowerCase() || 'view';
    
    // Initialiser les paramètres de groupe
    global.groupSettings = global.groupSettings || {};
    if (!global.groupSettings[from]) {
        global.groupSettings[from] = {
            antilink: false,
            welcome: true,
            antiDelete: false,
            autoMute: false,
            rules: null,
            warnings: true,
            autoKick: false,
            mediaRestriction: false,
            spamProtection: true,
            language: 'fr',
            timezone: 'Europe/Paris',
            modifiedBy: null,
            modifiedAt: null
        };
    }

    const settings = global.groupSettings[from];

    switch (action) {
        case 'view':
            const statusIcon = (status) => status ? '✅' : '❌';
            
            const settingsMessage = `
⚙️ **PARAMÈTRES DU GROUPE**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ **Sécurité & Modération**
• Anti-liens : ${statusIcon(settings.antilink)}
• Anti-suppression : ${statusIcon(settings.antiDelete)}
• Système d'avertissements : ${statusIcon(settings.warnings)}
• Auto-kick : ${statusIcon(settings.autoKick)}
• Protection spam : ${statusIcon(settings.spamProtection)}

👥 **Gestion des Membres**
• Message de bienvenue : ${statusIcon(settings.welcome)}
• Auto-mute : ${statusIcon(settings.autoMute)}
• Restriction média : ${statusIcon(settings.mediaRestriction)}

📋 **Informations Générales**
• Règles définies : ${settings.rules ? '✅ Oui' : '❌ Non'}
• Langue : ${settings.language.toUpperCase()}
• Fuseau horaire : ${settings.timezone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${settings.modifiedBy ? `🔧 **Dernière modification :**
👤 Par : @${settings.modifiedBy.split('@')[0]}
🕒 Le : ${new Date(settings.modifiedAt).toLocaleString()}` : ''}

📌 **Commandes disponibles :**
• \`.groupsettings edit\` - Modifier les paramètres
• \`.groupsettings reset\` - Réinitialiser tout
• \`.gsset [paramètre] [on/off]\` - Modification rapide

*Utilisez \`.help groupsettings\` pour plus d'infos*
            `;

            await conn.sendMessage(from, {
                text: settingsMessage,
                contextInfo: {
                    mentionedJid: settings.modifiedBy ? [settings.modifiedBy] : [],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363400575205721@newsletter',
                        newsletterName: '𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗',
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
            break;

        case 'edit':
            const editMessage = `
⚙️ **MODIFIER LES PARAMÈTRES**

📌 **Commandes de modification rapide :**

🛡️ **Sécurité :**
• \`.gsset antilink on/off\` - Anti-liens
• \`.gsset antidelete on/off\` - Anti-suppression
• \`.gsset warnings on/off\` - Avertissements
• \`.gsset autokick on/off\` - Auto-kick
• \`.gsset spam on/off\` - Protection spam

👥 **Membres :**
• \`.gsset welcome on/off\` - Bienvenue
• \`.gsset automute on/off\` - Auto-mute
• \`.gsset media on/off\` - Restriction média

📋 **Autres :**
• \`.gsset language fr/en/es\` - Langue
• \`.gsset timezone [timezone]\` - Fuseau horaire

💡 **Exemple :** \`.gsset antilink on\`
            `;
            reply(editMessage);
            break;

        case 'reset':
            global.groupSettings[from] = {
                antilink: false,
                welcome: true,
                antiDelete: false,
                autoMute: false,
                rules: null,
                warnings: true,
                autoKick: false,
                mediaRestriction: false,
                spamProtection: true,
                language: 'fr',
                timezone: 'Europe/Paris',
                modifiedBy: m.sender,
                modifiedAt: Date.now()
            };
            
            reply(`
🔄 **PARAMÈTRES RÉINITIALISÉS**

✅ Tous les paramètres ont été remis aux valeurs par défaut.
👤 **Réinitialisé par :** @${m.sender.split('@')[0]}
🕒 **Heure :** ${new Date().toLocaleString()}

*Utilisez \`.groupsettings view\` pour voir les nouveaux paramètres*
            `);
            break;

        default:
            reply(`
⚙️ **GESTIONNAIRE DE PARAMÈTRES**

📌 **Commandes disponibles :**
• \`.groupsettings view\` - Voir les paramètres actuels
• \`.groupsettings edit\` - Guide de modification
• \`.groupsettings reset\` - Réinitialiser tout

*Seuls les admins peuvent utiliser ces commandes*
            `);
    }
});

// Commande de modification rapide
ven({
    pattern: "gsset",
    react: "🔧",
    desc: "Modification rapide des paramètres de groupe",
    category: "group",
    filename: __filename,
    use: "[paramètre] [valeur]"
}, async (conn, mek, m, { from, isGroup, isGroupAdmins, isOwner, args, reply }) => {
    if (!isGroup) return reply("⚠️ Cette commande ne fonctionne que dans les groupes !");
    if (!isGroupAdmins && !isOwner) return reply("⚠️ Seuls les admins peuvent utiliser cette commande !");

    if (args.length < 2) {
        return reply(`
🔧 **MODIFICATION RAPIDE**

📌 **Utilisation :** \`.gsset [paramètre] [valeur]\`

**Paramètres disponibles :**
• antilink, antidelete, warnings, autokick, spam
• welcome, automute, media
• language, timezone

**Valeurs :** on/off (ou valeur spécifique)

💡 **Exemple :** \`.gsset antilink on\`
        `);
    }

    const parameter = args[0].toLowerCase();
    const value = args[1].toLowerCase();

    // Initialiser les paramètres
    global.groupSettings = global.groupSettings || {};
    if (!global.groupSettings[from]) {
        global.groupSettings[from] = {
            antilink: false, welcome: true, antiDelete: false,
            autoMute: false, rules: null, warnings: true,
            autoKick: false, mediaRestriction: false, spamProtection: true,
            language: 'fr', timezone: 'Europe/Paris',
            modifiedBy: null, modifiedAt: null
        };
    }

    const settings = global.groupSettings[from];
    const boolValue = value === 'on' || value === 'true';

    switch (parameter) {
        case 'antilink':
            settings.antilink = boolValue;
            reply(`🔗 **Anti-liens ${boolValue ? 'activé' : 'désactivé'}** pour ce groupe.`);
            break;

        case 'antidelete':
            settings.antiDelete = boolValue;
            reply(`🗑️ **Anti-suppression ${boolValue ? 'activé' : 'désactivé'}** pour ce groupe.`);
            break;

        case 'warnings':
            settings.warnings = boolValue;
            reply(`⚠️ **Système d'avertissements ${boolValue ? 'activé' : 'désactivé'}** pour ce groupe.`);
            break;

        case 'autokick':
            settings.autoKick = boolValue;
            reply(`👢 **Auto-kick ${boolValue ? 'activé' : 'désactivé'}** pour ce groupe.`);
            break;

        case 'spam':
            settings.spamProtection = boolValue;
            reply(`🚫 **Protection spam ${boolValue ? 'activée' : 'désactivée'}** pour ce groupe.`);
            break;

        case 'welcome':
            settings.welcome = boolValue;
            reply(`👋 **Messages de bienvenue ${boolValue ? 'activés' : 'désactivés'}** pour ce groupe.`);
            break;

        case 'automute':
            settings.autoMute = boolValue;
            reply(`🔇 **Auto-mute ${boolValue ? 'activé' : 'désactivé'}** pour ce groupe.`);
            break;

        case 'media':
            settings.mediaRestriction = boolValue;
            reply(`📱 **Restriction média ${boolValue ? 'activée' : 'désactivée'}** pour ce groupe.`);
            break;

        case 'language':
            if (['fr', 'en', 'es'].includes(value)) {
                settings.language = value;
                reply(`🌐 **Langue changée en ${value.toUpperCase()}** pour ce groupe.`);
            } else {
                reply(`❌ Langue non supportée. Utilisez : fr, en, es`);
            }
            break;

        case 'timezone':
            settings.timezone = args.slice(1).join(' ');
            reply(`🕒 **Fuseau horaire changé en ${settings.timezone}** pour ce groupe.`);
            break;

        default:
            reply(`
❌ **Paramètre inconnu :** ${parameter}

**Paramètres disponibles :**
• antilink, antidelete, warnings, autokick, spam
• welcome, automute, media
• language, timezone

*Utilisez \`.groupsettings edit\` pour voir le guide complet*
            `);
            return;
    }

    // Mettre à jour les infos de modification
    settings.modifiedBy = m.sender;
    settings.modifiedAt = Date.now();
});
