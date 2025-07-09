const { ven, commands } = require('../hisoka');
const config = require('../settings');
const { createBox, infoBox, createList } = require('../lib/msg-formatter');

// Système d'aide général avec commandes dynamiques
ven({
    pattern: "help",
    react: "❓",
    desc: "Système d'aide détaillé",
    category: "main",
    filename: __filename,
    use: "[catégorie]"
}, async (conn, mek, m, { from, args, reply }) => {
    const category = args[0]?.toLowerCase();

    if (!category) {
        // Génération dynamique des catégories
        let categories = {};
        commands.forEach(cmd => {
            if (cmd.pattern && !cmd.dontAddCommandList && cmd.category) {
                if (!categories[cmd.category]) categories[cmd.category] = [];
                categories[cmd.category].push(cmd.pattern);
            }
        });

        const helpMenu = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│  🆘 『 𝗦𝗬𝗦𝗧𝗘𝗠𝗘 𝗗'𝗔𝗜𝗗𝗘 』  │
│  ──────────────────────────────  
│  💡 𝘚𝘦𝘭𝘦𝘤𝘵𝘪𝘰𝘯𝘯𝘦𝘻 𝘶𝘯𝘦 𝘤𝘢𝘵𝘦𝘨𝘰𝘳𝘪𝘦  
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📂 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦 𝗗𝗜𝗦𝗣𝗢𝗡𝗜𝗕𝗟𝗘𝗦   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
${Object.keys(categories).map(cat => {
    const icon = getCategoryIcon(cat);
    const count = categories[cat].length;
    return `┃ ${icon} .help ${cat.padEnd(12)} (${count})`;
}).join('\n')}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔥 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘𝗦 𝗣𝗢𝗣𝗨𝗟𝗔𝗜𝗥𝗘𝗦     ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📊 .menu        Menu principal  ┃
┃ 📋 .rules       Règles groupe   ┃
┃ 🏆 .rank        Classement      ┃
┃ 📈 .insights    Statistiques    ┃
┃ 🎮 .games       Jeux groupe     ┃
┃ 📢 .tagall      Tag tous        ┃
┃ ⚙️ .groupsettings Paramètres    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 💡 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗜𝗢𝗡              
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ • .help group - Aide groupes    ┃
┃ • .help download - Téléchargement┃
┃ • .help ai - Intelligence AI    ┃
┃ • .help owner - Propriétaire    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🎊 **Besoin d'aide ?** Contactez .owner
        `.trim();

        await conn.sendMessage(from, {
            text: helpMenu,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363400575205721@newsletter',
                    newsletterName: '𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        return;
    }

    // Aide spécifique par catégorie avec commandes dynamiques
    let categoryCommands = {};
    commands.forEach(cmd => {
        if (cmd.pattern && !cmd.dontAddCommandList && cmd.category === category) {
            if (!categoryCommands[cmd.category]) categoryCommands[cmd.category] = [];
            categoryCommands[cmd.category].push({
                pattern: cmd.pattern,
                desc: cmd.desc || 'Aucune description',
                use: cmd.use || ''
            });
        }
    });

    if (categoryCommands[category]) {
        const icon = getCategoryIcon(category);
        const title = getCategoryTitle(category);

        let helpText = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
│  ${icon} ${title}  
│  ───────────────  
│  📝 ${categoryCommands[category].length} commandes disponibles  
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📋 𝗟𝗜𝗦𝗧𝗘 𝗗𝗘𝗦 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘𝗦     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
${categoryCommands[category].map(cmd => {
    const usage = cmd.use ? ` ${cmd.use}` : '';
    return `┃ ⬡ .${cmd.pattern}${usage}\n┃   ${cmd.desc}`;
}).join('\n┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n')}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

💡 **Exemple :** .${categoryCommands[category][0].pattern}${categoryCommands[category][0].use || ''}
        `.trim();

        await conn.sendMessage(from, {
            text: helpText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363400575205721@newsletter',
                    newsletterName: '𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
    } else {
        const availableCategories = [...new Set(commands.map(cmd => cmd.category))].filter(Boolean);

        const { errorBox } = require('../lib/msg-formatter');
        reply(errorBox(
            `🔍 Commande "${category}" introuvable\n` +
            `💡 Utilisez .help pour voir toutes\n` +
            `   les commandes disponibles`,
            '❌ COMMANDE INTROUVABLE'
        ));
    }
});

// Fonction pour obtenir l'icône de catégorie
function getCategoryIcon(category) {
    const icons = {
        'group': '🏛️',
        'download': '📥',
        'owner': '👑',
        'ai': '🧠',
        'anime': '✨',
        'convert': '🔄',
        'reaction': '🎭',
        'fun': '🎉',
        'main': '⚙️',
        'other': '🛠️'
    };
    return icons[category] || '📋';
}

// Fonction pour obtenir le titre de catégorie
function getCategoryTitle(category) {
    const titles = {
        'group': '𝗚𝗘𝗦𝗧𝗜𝗢𝗡 𝗚𝗥𝗢𝗨𝗣𝗘',
        'download': '𝗧𝗘𝗟𝗘𝗖𝗛𝗔𝗥𝗚𝗘𝗠𝗘𝗡𝗧',
        'owner': '𝗣𝗥𝗢𝗣𝗥𝗜𝗘𝗧𝗔𝗜𝗥𝗘',
        'ai': '𝗜𝗡𝗧𝗘𝗟𝗟𝗜𝗚𝗘𝗡𝗖𝗘 𝗔𝗜',
        'anime': '𝗔𝗡𝗜𝗠𝗘 & 𝗟𝗢𝗚𝗢',
        'convert': '𝗖𝗢𝗡𝗩𝗘𝗥𝗦𝗜𝗢𝗡',
        'reaction': '𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡𝗦',
        'fun': '𝗗𝗜𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗠𝗘𝗡𝗧',
        'main': '𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘𝗦 𝗣𝗥𝗜𝗡𝗖𝗜𝗣𝗔𝗟𝗘𝗦',
        'other': '𝗨𝗧𝗜𝗟𝗜𝗧𝗔𝗜𝗥𝗘𝗦'
    };
    return titles[category] || '𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘';
}