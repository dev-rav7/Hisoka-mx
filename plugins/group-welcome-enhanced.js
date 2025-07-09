
const { ven } = require('../hisoka');
const config = require('../settings');

// Stockage des paramètres de bienvenue
let welcomeSettings = {};

ven({
    pattern: 'setwelcome',
    desc: 'Configurer le message de bienvenue',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        if (!isAdmins) return reply("❌ Seuls les admins peuvent configurer la bienvenue !");

        const welcomeText = args.join(' ');
        if (!welcomeText) return reply("❌ Veuillez fournir un message de bienvenue !");

        if (!welcomeSettings[from]) welcomeSettings[from] = {};
        welcomeSettings[from].message = welcomeText;
        welcomeSettings[from].enabled = true;

        const setupMessage = `│ ✅ MESSAGE DE BIENVENUE CONFIGURÉ
│ 
│ 📌 Groupe: ${groupName}
│ 👤 Configuré par: ${pushname}
│ 
│ Variables disponibles:
│ • {user} = Nom de l'utilisateur
│ • {group} = Nom du groupe
│ • {count} = Nombre de membres
│ • {date} = Date actuelle
│ 
│ Aperçu:
│ ${welcomeText.replace('{user}', 'NouveauMembre').replace('{group}', groupName).replace('{count}', participants.length).replace('{date}', new Date().toLocaleDateString())}
│ 
│ > ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { text: setupMessage });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de la configuration !");
    }
});

ven({
    pattern: 'togglewelcome',
    desc: 'Activer/désactiver la bienvenue',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, pushname, reply, groupName }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        if (!isAdmins) return reply("❌ Seuls les admins peuvent modifier ce paramètre !");

        if (!welcomeSettings[from]) welcomeSettings[from] = { enabled: false };
        
        welcomeSettings[from].enabled = !welcomeSettings[from].enabled;
        const status = welcomeSettings[from].enabled ? 'activé' : 'désactivé';

        await conn.sendMessage(from, { 
            text: `│ ${welcomeSettings[from].enabled ? '✅' : '❌'} BIENVENUE ${status.toUpperCase()}\n│ \n│ 📌 Groupe: ${groupName}\n│ 👤 Modifié par: ${pushname}`
        });
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de la modification !");
    }
});

// Intercepter les événements de groupe pour la bienvenue
ven({
    on: "group-participants-update"
}, async (conn, update) => {
    try {
        if (update.action !== 'add') return;

        const groupId = update.id;
        const settings = welcomeSettings[groupId];
        
        if (!settings || !settings.enabled || !settings.message) return;

        const groupMetadata = await conn.groupMetadata(groupId);
        
        for (const participant of update.participants) {
            const userName = participant.split('@')[0];
            
            let welcomeMessage = settings.message
                .replace(/{user}/g, userName)
                .replace(/{group}/g, groupMetadata.subject)
                .replace(/{count}/g, groupMetadata.participants.length)
                .replace(/{date}/g, new Date().toLocaleDateString());

            // Ajouter un GIF de bienvenue aléatoire
            const welcomeGifs = [
                'https://media.giphy.com/media/Cmr1OMJ2FN0B2/giphy.gif',
                'https://media.giphy.com/media/l0MYy7QpDDVGVfAAw/giphy.gif',
                'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif'
            ];

            const randomGif = welcomeGifs[Math.floor(Math.random() * welcomeGifs.length)];

            await conn.sendMessage(groupId, {
                video: { url: randomGif },
                caption: `🎉 *BIENVENUE* 🎉\n\n${welcomeMessage}`,
                mentions: [participant],
                gifPlayback: true
            });
        }
        
    } catch (err) {
        console.error(err);
    }
});
