const { ven } = require('../hisoka');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

// Configuration des APIs
const API_CONFIG = {
    rapidapi: {
        key: process.env.RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY',
        host: 'social-media-video-downloader.p.rapidapi.com'
    },
    instagram: {
        api: 'https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index',
        host: 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com'
    },
    tiktok: {
        api: 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
        host: 'tiktok-video-no-watermark2.p.rapidapi.com'
    },
    pinterest: {
        api: 'https://pinterest-downloader-video-image.p.rapidapi.com/pinterest',
        host: 'pinterest-downloader-video-image.p.rapidapi.com'
    }
};

// Fonction utilitaire pour télécharger des fichiers
const downloadFile = async (url, filepath) => {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

// Plugin pour télécharger des images/vidéos Instagram
ven({
    pattern: "insta",
    desc: "Télécharge des images/vidéos Instagram",
    category: "download",
    react: "📷",
    filename: __filename,
    use: "<lien instagram>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir un lien Instagram.\nUtilisation : .insta <lien>");
        
        const url = args[0];
        if (!url.includes('instagram.com')) {
            return reply("Veuillez fournir un lien Instagram valide.");
        }
        
        reply("⏳ Téléchargement en cours...");
        
        const options = {
            method: 'GET',
            url: API_CONFIG.instagram.api,
            params: { url: url },
            headers: {
                'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                'X-RapidAPI-Host': API_CONFIG.instagram.host
            }
        };
        
        const response = await axios.request(options);
        
        if (response.data && response.data.media && response.data.media.length > 0) {
            const media = response.data.media[0];
            const mediaUrl = media.url;
            const mediaType = media.type;
            
            if (mediaType === 'image') {
                await conn.sendMessage(mek.chat, {
                    image: { url: mediaUrl },
                    caption: `📷 *Instagram Image*\n\n✅ Téléchargée avec succès!`,
                    contextInfo: getContextInfo()
                }, { quoted: mek });
            } else if (mediaType === 'video') {
                await conn.sendMessage(mek.chat, {
                    video: { url: mediaUrl },
                    caption: `🎥 *Instagram Video*\n\n✅ Téléchargée avec succès!`,
                    contextInfo: getContextInfo()
                }, { quoted: mek });
            }
        } else {
            throw new Error("Aucun média trouvé");
        }

    } catch (error) {
        console.log(error);
        await conn.sendMessage(mek.chat, {
            text: "📷 *Erreur Instagram*\n\n❌ Impossible de télécharger le contenu.\nVérifiez que le lien est valide et public.",
            contextInfo: getContextInfo()
        }, { quoted: mek });
    }
});

// Plugin pour télécharger des vidéos Facebook
ven({
    pattern: "facebook",
    desc: "Télécharge des vidéos Facebook",
    category: "download",
    react: "📘",
    filename: __filename,
    use: "<lien facebook>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir un lien Facebook.\nUtilisation : .facebook <lien>");
        
        const url = args[0];
        if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
            return reply("Veuillez fournir un lien Facebook valide.");
        }
        
        reply("⏳ Téléchargement en cours...");
        
        const options = {
            method: 'GET',
            url: 'https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php',
            params: { url: url },
            headers: {
                'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                'X-RapidAPI-Host': 'facebook-reel-and-video-downloader.p.rapidapi.com'
            }
        };
        
        const response = await axios.request(options);
        
        if (response.data && response.data.success && response.data.data) {
            const videoData = response.data.data;
            const videoUrl = videoData.video_url || videoData.hd || videoData.sd;
            
            if (videoUrl) {
                await conn.sendMessage(mek.chat, {
                    video: { url: videoUrl },
                    caption: `📘 *Facebook Video*\n\n✅ Téléchargée avec succès!\n📱 Titre: ${videoData.title || 'Non disponible'}`,
                    contextInfo: getContextInfo()
                }, { quoted: mek });
            } else {
                throw new Error("URL de vidéo non trouvée");
            }
        } else {
            throw new Error("Réponse invalide de l'API");
        }

    } catch (error) {
        console.log(error);
        await conn.sendMessage(mek.chat, {
            text: "📘 *Erreur Facebook*\n\n❌ Impossible de télécharger la vidéo.\nVérifiez que le lien est valide et public.",
            contextInfo: getContextInfo()
        }, { quoted: mek });
    }
});

// Plugin pour télécharger des images Pinterest
ven({
    pattern: "pinterest",
    desc: "Recherche et télécharge des images Pinterest",
    category: "download",
    react: "📌",
    filename: __filename,
    use: "<terme de recherche ou lien>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir un terme de recherche ou un lien.\nUtilisation : .pinterest anime");
        
        const query = args.join(" ");
        reply("⏳ Recherche en cours...");
        
        let searchUrl;
        if (query.includes('pinterest.com')) {
            // Si c'est un lien Pinterest
            searchUrl = query;
        } else {
            // Si c'est un terme de recherche
            const searchOptions = {
                method: 'GET',
                url: 'https://pinterest-api1.p.rapidapi.com/search',
                params: { query: query, limit: '10' },
                headers: {
                    'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                    'X-RapidAPI-Host': 'pinterest-api1.p.rapidapi.com'
                }
            };
            
            const searchResponse = await axios.request(searchOptions);
            
            if (searchResponse.data && searchResponse.data.data && searchResponse.data.data.length > 0) {
                const randomPin = searchResponse.data.data[Math.floor(Math.random() * searchResponse.data.data.length)];
                
                await conn.sendMessage(mek.chat, {
                    image: { url: randomPin.image },
                    caption: `📌 *Pinterest Image*\n\n🔍 Recherche: ${query}\n📝 Titre: ${randomPin.title || 'Non disponible'}\n✅ Téléchargée avec succès!`,
                    contextInfo: getContextInfo()
                }, { quoted: mek });
            } else {
                throw new Error("Aucune image trouvée");
            }
            return;
        }
        
        // Traitement pour les liens Pinterest
        const options = {
            method: 'GET',
            url: API_CONFIG.pinterest.api,
            params: { url: searchUrl },
            headers: {
                'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                'X-RapidAPI-Host': API_CONFIG.pinterest.host
            }
        };
        
        const response = await axios.request(options);
        
        if (response.data && response.data.image_url) {
            await conn.sendMessage(mek.chat, {
                image: { url: response.data.image_url },
                caption: `📌 *Pinterest Image*\n\n✅ Téléchargée avec succès!`,
                contextInfo: getContextInfo()
            }, { quoted: mek });
        } else {
            throw new Error("Image non trouvée");
        }

    } catch (error) {
        console.log(error);
        await conn.sendMessage(mek.chat, {
            text: `📌 *Erreur Pinterest*\n\n❌ Impossible de télécharger l'image.\nVérifiez votre recherche ou lien.`,
            contextInfo: getContextInfo()
        }, { quoted: mek });
    }
});

// Plugin pour télécharger des vidéos Twitter/X
ven({
    pattern: "twitter",
    desc: "Télécharge des vidéos Twitter/X",
    category: "download",
    react: "🐦",
    filename: __filename,
    use: "<lien twitter>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir un lien Twitter.\nUtilisation : .twitter <lien>");
        
        const url = args[0];
        if (!url.includes('twitter.com') && !url.includes('x.com')) {
            return reply("Veuillez fournir un lien Twitter/X valide.");
        }
        
        reply("⏳ Téléchargement en cours...");
        
        const options = {
            method: 'GET',
            url: 'https://twitter-api47.p.rapidapi.com/v2/tweet/details',
            params: { url: url },
            headers: {
                'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                'X-RapidAPI-Host': 'twitter-api47.p.rapidapi.com'
            }
        };
        
        const response = await axios.request(options);
        
        if (response.data && response.data.media && response.data.media.videos && response.data.media.videos.length > 0) {
            const video = response.data.media.videos[0];
            const videoUrl = video.url;
            
            await conn.sendMessage(mek.chat, {
                video: { url: videoUrl },
                caption: `🐦 *Twitter Video*\n\n✅ Téléchargée avec succès!\n📱 Auteur: ${response.data.user?.name || 'Non disponible'}`,
                contextInfo: getContextInfo()
            }, { quoted: mek });
        } else if (response.data && response.data.media && response.data.media.photos && response.data.media.photos.length > 0) {
            const photo = response.data.media.photos[0];
            
            await conn.sendMessage(mek.chat, {
                image: { url: photo.url },
                caption: `🐦 *Twitter Image*\n\n✅ Téléchargée avec succès!\n📱 Auteur: ${response.data.user?.name || 'Non disponible'}`,
                contextInfo: getContextInfo()
            }, { quoted: mek });
        } else {
            throw new Error("Aucun média trouvé");
        }

    } catch (error) {
        console.log(error);
        await conn.sendMessage(mek.chat, {
            text: "🐦 *Erreur Twitter*\n\n❌ Impossible de télécharger le contenu.\nVérifiez que le lien est valide et public.",
            contextInfo: getContextInfo()
        }, { quoted: mek });
    }
});

// Plugin pour télécharger des APK
ven({
    pattern: "apk",
    desc: "Recherche et télécharge des APK",
    category: "download",
    react: "📱",
    filename: __filename,
    use: "<nom de l'app>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir le nom d'une application.\nUtilisation : .apk WhatsApp");
        
        const appName = args.join(" ");
        reply("⏳ Recherche de l'APK...");
        
        const options = {
            method: 'GET',
            url: 'https://apkpure-api.p.rapidapi.com/api/search',
            params: { q: appName, limit: '5' },
            headers: {
                'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                'X-RapidAPI-Host': 'apkpure-api.p.rapidapi.com'
            }
        };
        
        const response = await axios.request(options);
        
        if (response.data && response.data.results && response.data.results.length > 0) {
            const app = response.data.results[0];
            
            // Obtenir le lien de téléchargement
            const downloadOptions = {
                method: 'GET',
                url: 'https://apkpure-api.p.rapidapi.com/api/download',
                params: { package: app.package },
                headers: {
                    'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                    'X-RapidAPI-Host': 'apkpure-api.p.rapidapi.com'
                }
            };
            
            const downloadResponse = await axios.request(downloadOptions);
            
            if (downloadResponse.data && downloadResponse.data.download_url) {
                await conn.sendMessage(mek.chat, {
                    document: { url: downloadResponse.data.download_url },
                    fileName: `${app.name}.apk`,
                    mimetype: 'application/vnd.android.package-archive',
                    caption: `📱 *APK Download*\n\n📦 App: ${app.name}\n📊 Version: ${app.version}\n⭐ Rating: ${app.rating || 'N/A'}\n✅ Téléchargée avec succès!`,
                    contextInfo: getContextInfo()
                }, { quoted: mek });
            } else {
                throw new Error("Lien de téléchargement non trouvé");
            }
        } else {
            throw new Error("Application non trouvée");
        }

    } catch (error) {
        console.log(error);
        await conn.sendMessage(mek.chat, {
            text: `📱 *Erreur APK*\n\n❌ Impossible de télécharger l'APK.\nVérifiez le nom de l'application.`,
            contextInfo: getContextInfo()
        }, { quoted: mek });
    }
});

// Plugin pour télécharger des vidéos Dailymotion
ven({
    pattern: "dailymotion",
    desc: "Télécharge des vidéos Dailymotion",
    category: "download",
    react: "🎬",
    filename: __filename,
    use: "<lien dailymotion>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir un lien Dailymotion.\nUtilisation : .dailymotion <lien>");
        
        const url = args[0];
        if (!url.includes('dailymotion.com')) {
            return reply("Veuillez fournir un lien Dailymotion valide.");
        }
        
        reply("⏳ Téléchargement en cours...");
        
        const options = {
            method: 'GET',
            url: 'https://dailymotion-video-downloader.p.rapidapi.com/video/info',
            params: { url: url },
            headers: {
                'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                'X-RapidAPI-Host': 'dailymotion-video-downloader.p.rapidapi.com'
            }
        };
        
        const response = await axios.request(options);
        
        if (response.data && response.data.video_url) {
            await conn.sendMessage(mek.chat, {
                video: { url: response.data.video_url },
                caption: `🎬 *Dailymotion Video*\n\n✅ Téléchargée avec succès!\n📱 Titre: ${response.data.title || 'Non disponible'}\n⏱️ Durée: ${response.data.duration || 'N/A'}`,
                contextInfo: getContextInfo()
            }, { quoted: mek });
        } else {
            throw new Error("Vidéo non trouvée");
        }

    } catch (error) {
        console.log(error);
        await conn.sendMessage(mek.chat, {
            text: "🎬 *Erreur Dailymotion*\n\n❌ Impossible de télécharger la vidéo.\nVérifiez que le lien est valide.",
            contextInfo: getContextInfo()
        }, { quoted: mek });
    }
});

// Plugin pour télécharger des vidéos TikTok
ven({
    pattern: "tiktok",
    desc: "Télécharge des vidéos TikTok sans watermark",
    category: "download",
    react: "🎵",
    filename: __filename,
    use: "<lien tiktok>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("Veuillez fournir un lien TikTok.\nUtilisation : .tiktok <lien>");
        
        const url = args[0];
        if (!url.includes('tiktok.com')) {
            return reply("Veuillez fournir un lien TikTok valide.");
        }
        
        reply("⏳ Téléchargement en cours...");
        
        const options = {
            method: 'GET',
            url: API_CONFIG.tiktok.api,
            params: { url: url },
            headers: {
                'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                'X-RapidAPI-Host': API_CONFIG.tiktok.host
            }
        };
        
        const response = await axios.request(options);
        
        if (response.data && response.data.data && response.data.data.play) {
            const videoUrl = response.data.data.play;
            const musicUrl = response.data.data.music;
            
            await conn.sendMessage(mek.chat, {
                video: { url: videoUrl },
                caption: `🎵 *TikTok Video*\n\n✅ Téléchargée avec succès!\n📱 Auteur: ${response.data.data.author?.nickname || 'Non disponible'}\n📝 Description: ${response.data.data.title || 'Non disponible'}`,
                contextInfo: getContextInfo()
            }, { quoted: mek });
            
            // Envoyer aussi l'audio si disponible
            if (musicUrl) {
                await conn.sendMessage(mek.chat, {
                    audio: { url: musicUrl },
                    mimetype: 'audio/mpeg',
                    caption: `🎵 *TikTok Audio*\n\n🎼 Musique extraite de la vidéo`,
                    contextInfo: getContextInfo()
                }, { quoted: mek });
            }
        } else {
            throw new Error("Vidéo non trouvée");
        }

    } catch (error) {
        console.log(error);
        await conn.sendMessage(mek.chat, {
            text: "🎵 *Erreur TikTok*\n\n❌ Impossible de télécharger la vidéo.\nVérifiez que le lien est valide.",
            contextInfo: getContextInfo()
        }, { quoted: mek });
    }
});

module.exports = {
    downloadFile,
    API_CONFIG
};