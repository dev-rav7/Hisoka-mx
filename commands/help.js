const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
   const helpMessage = `
╔═══════════════════╗
   *🎭 『𝙒𝘼・𝙃𝙄𝙎・𝙑𝟭』 🎭*
   Version: *${settings.version || '2.0.5'}*
   by *hhhisoka*
 
╚═══════════════════╝

*🎴 COMMANDES DISPONIBLES 🎴*

╔═══════════════════╗
🌐 *Commandes Générales*:
║ ➤ .help / .menu
║ ➤ .ping
║ ➤ .alive
║ ➤ .tts <texte>
║ ➤ .owner
║ ➤ .joke
║ ➤ .quote
║ ➤ .fact
║ ➤ .weather <ville>
║ ➤ .news
║ ➤ .attp <texte>
║ ➤ .lyrics <titre>
║ ➤ .8ball <question>
║ ➤ .groupinfo
║ ➤ .staff / .admins
║ ➤ .vv
║ ➤ .trt <texte> <langue>
║ ➤ .ss <lien>
║ ➤ .jid
╚═══════════════════╝

╔═══════════════════╗
👑 *Commandes Admin*:
║ ➤ .ban @user
║ ➤ .promote @user
║ ➤ .demote @user
║ ➤ .mute <minutes>
║ ➤ .unmute
║ ➤ .delete / .del
║ ➤ .kick @user
║ ➤ .warnings @user
║ ➤ .warn @user
║ ➤ .antilink
║ ➤ .antibadword
║ ➤ .clear
║ ➤ .tag <msg>
║ ➤ .tagall
║ ➤ .chatbot
║ ➤ .resetlink
║ ➤ .welcome on/off
║ ➤ .goodbye on/off
╚═══════════════════╝

╔═══════════════════╗
🔒 *Commandes Owner*:
║ ➤ .mode
║ ➤ .autostatus
║ ➤ .clearsession
║ ➤ .antidelete
║ ➤ .cleartmp
║ ➤ .setpp <image>
║ ➤ .autoreact
╚═══════════════════╝

╔═══════════════════╗
🎨 *Stickers & Images*:
║ ➤ .blur <image>
║ ➤ .simage <sticker>
║ ➤ .sticker <image>
║ ➤ .tgsticker <lien>
║ ➤ .meme
║ ➤ .take <packname>
║ ➤ .emojimix <emoji1>+<emoji2>
╚═══════════════════╝

╔═══════════════════╗
🎮 *Jeux*:
║ ➤ .tictactoe @user
║ ➤ .hangman
║ ➤ .guess <lettre>
║ ➤ .trivia
║ ➤ .answer <réponse>
║ ➤ .truth
║ ➤ .dare
╚═══════════════════╝

╔═══════════════════╗
🧠 *Commandes IA*:
║ ➤ .gpt <question>
║ ➤ .gemini <question>
║ ➤ .imagine <prompt>
║ ➤ .flux <prompt>
╚═══════════════════╝

╔═══════════════════╗
🎯 *Commandes Fun*:
║ ➤ .compliment @user
║ ➤ .insult @user
║ ➤ .flirt
║ ➤ .shayari
║ ➤ .goodnight
║ ➤ .roseday
║ ➤ .character @user
║ ➤ .wasted @user
║ ➤ .ship @user
║ ➤ .simp @user
║ ➤ .stupid @user [texte]
╚═══════════════════╝

╔═══════════════════╗
🔤 *Textmaker*:
║ ➤ .metallic
║ ➤ .ice
║ ➤ .snow
║ ➤ .impressive
║ ➤ .matrix
║ ➤ .light
║ ➤ .neon
║ ➤ .devil
║ ➤ .purple
║ ➤ .thunder
║ ➤ .leaves
║ ➤ .1917
║ ➤ .arena
║ ➤ .hacker
║ ➤ .sand
║ ➤ .blackpink
║ ➤ .glitch
║ ➤ .fire
╚═══════════════════╝

╔═══════════════════╗
📥 *Téléchargement*:
║ ➤ .play <titre>
║ ➤ .song <titre>
║ ➤ .instagram <lien>
║ ➤ .facebook <lien>
║ ➤ .tiktok <lien>
║ ➤ .video <titre>
║ ➤ .ytmp4 <lien>
╚═══════════════════╝

╔═══════════════════╗
💻 *Code / GitHub*:
║ ➤ .git
║ ➤ .github
║ ➤ .sc
║ ➤ .script
║ ➤ .repo
╚═══════════════════╝

📢 *Rejoins notre canal pour plus de mises à jour !*
`;
    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'KnightBot MD',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: 'null',
                        newsletterName: 'Wa-his-v1',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
