
const { ven } = require('../hisoka');
const axios = require('axios');

const getContextInfo = () => {
    return {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363400575205721@newsletter',
            newsletterName: '𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗',
            serverMessageId: 143,
        },
    };
};

// Plugin pour obtenir des informations sur un anime
ven({
    pattern: "anime",
    desc: "Recherche des informations sur un anime",
    category: "anime",
    react: "🎌",
    filename: __filename,
    use: "<nom de l'anime>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir le nom d'un anime.\nUtilisation : .anime Naruto");
        
        const animeName = args.join(" ");
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
        
        if (response.data.data.length === 0) {
            return reply("Aucun anime trouvé avec ce nom.");
        }
        
        const anime = response.data.data[0];
        const message = `
🎌 *${anime.title}*
📺 *Titre japonais:* ${anime.title_japanese || 'N/A'}
⭐ *Score:* ${anime.score || 'N/A'}/10
📅 *Année:* ${anime.year || 'N/A'}
🎭 *Genre:* ${anime.genres.map(g => g.name).join(', ')}
📺 *Épisodes:* ${anime.episodes || 'N/A'}
📱 *Statut:* ${anime.status}
🏢 *Studio:* ${anime.studios.map(s => s.name).join(', ')}

📖 *Synopsis:*
${anime.synopsis ? anime.synopsis.substring(0, 300) + '...' : 'Pas de synopsis disponible'}

🔗 *Lien MAL:* ${anime.url}
        `.trim();

        await conn.sendMessage(mek.chat, {
            image: { url: anime.images.jpg.large_image_url },
            caption: message,
            contextInfo: getContextInfo()
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply("Erreur lors de la recherche d'anime.");
    }
});

// Plugin pour obtenir des citations d'anime
ven({
    pattern: "animequote",
    desc: "Obtient une citation d'anime aléatoire",
    category: "anime",
    react: "💬",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const response = await axios.get('https://animechan.vercel.app/api/random');
        const quote = response.data;
        
        const message = `
💬 *Citation Anime*

"${quote.quote}"

👤 *Personnage:* ${quote.character}
🎌 *Anime:* ${quote.anime}
        `.trim();

        await conn.sendMessage(mek.chat, {
            text: message,
            contextInfo: getContextInfo()
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply("Erreur lors de la récupération de la citation.");
    }
});

// Plugin pour rechercher des mangas
ven({
    pattern: "manga",
    desc: "Recherche des informations sur un manga",
    category: "anime",
    react: "📚",
    filename: __filename,
    use: "<nom du manga>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir le nom d'un manga.\nUtilisation : .manga One Piece");
        
        const mangaName = args.join(" ");
        const response = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(mangaName)}&limit=1`);
        
        if (response.data.data.length === 0) {
            return reply("Aucun manga trouvé avec ce nom.");
        }
        
        const manga = response.data.data[0];
        const message = `
📚 *${manga.title}*
📖 *Titre japonais:* ${manga.title_japanese || 'N/A'}
⭐ *Score:* ${manga.score || 'N/A'}/10
📅 *Année:* ${manga.published.prop.from.year || 'N/A'}
🎭 *Genre:* ${manga.genres.map(g => g.name).join(', ')}
📄 *Chapitres:* ${manga.chapters || 'N/A'}
📚 *Volumes:* ${manga.volumes || 'N/A'}
📱 *Statut:* ${manga.status}
✍️ *Auteur:* ${manga.authors.map(a => a.name).join(', ')}

📖 *Synopsis:*
${manga.synopsis ? manga.synopsis.substring(0, 300) + '...' : 'Pas de synopsis disponible'}

🔗 *Lien MAL:* ${manga.url}
        `.trim();

        await conn.sendMessage(mek.chat, {
            image: { url: manga.images.jpg.large_image_url },
            caption: message,
            contextInfo: getContextInfo()
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply("Erreur lors de la recherche de manga.");
    }
});

// Plugin pour obtenir des personnages d'anime
ven({
    pattern: "character",
    desc: "Recherche des informations sur un personnage d'anime",
    category: "anime",
    react: "👤",
    filename: __filename,
    use: "<nom du personnage>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir le nom d'un personnage.\nUtilisation : .character Naruto");
        
        const characterName = args.join(" ");
        const response = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(characterName)}&limit=1`);
        
        if (response.data.data.length === 0) {
            return reply("Aucun personnage trouvé avec ce nom.");
        }
        
        const character = response.data.data[0];
        const message = `
👤 *${character.name}*
🌸 *Nom japonais:* ${character.name_kanji || 'N/A'}
💖 *Favoris:* ${character.favorites || 'N/A'}

📖 *Description:*
${character.about ? character.about.substring(0, 400) + '...' : 'Pas de description disponible'}

🔗 *Lien MAL:* ${character.url}
        `.trim();

        await conn.sendMessage(mek.chat, {
            image: { url: character.images.jpg.image_url },
            caption: message,
            contextInfo: getContextInfo()
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply("Erreur lors de la recherche de personnage.");
    }
});

// Plugin pour obtenir des waifus
ven({
    pattern: "waifu",
    desc: "Obtient une image de waifu aléatoire",
    category: "anime",
    react: "💕",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const response = await axios.get('https://api.waifu.pics/sfw/waifu');
        
        await conn.sendMessage(mek.chat, {
            image: { url: response.data.url },
            caption: "💕 *Voici une waifu pour vous !*",
            contextInfo: getContextInfo()
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply("Erreur lors de la récupération de waifu.");
    }
});

// Plugin pour obtenir des images de neko
ven({
    pattern: "neko",
    desc: "Obtient une image de neko aléatoire",
    category: "anime",
    react: "🐱",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const response = await axios.get('https://api.waifu.pics/sfw/neko');
        
        await conn.sendMessage(mek.chat, {
            image: { url: response.data.url },
            caption: "🐱 *Nyaa~ Voici un neko mignon !*",
            contextInfo: getContextInfo()
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply("Erreur lors de la récupération de neko.");
    }
});

// Plugin pour obtenir des gifs d'anime
ven({
    pattern: "animegif",
    desc: "Obtient un GIF d'anime aléatoire",
    category: "anime",
    react: "🎥",
    filename: __filename,
    use: "<type: hug, kiss, pat, etc.>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        const types = ['hug', 'kiss', 'pat', 'slap', 'wave', 'dance', 'cry', 'bite', 'blush', 'smile'];
        const type = args[0] || types[Math.floor(Math.random() * types.length)];
        
        const response = await axios.get(`https://api.waifu.pics/sfw/${type}`);
        
        await conn.sendMessage(mek.chat, {
            video: { url: response.data.url },
            caption: `🎥 *${type.toUpperCase()} Anime GIF*`,
            gifPlayback: true,
            contextInfo: getContextInfo()
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply("Erreur lors de la récupération du GIF anime.");
    }
});
