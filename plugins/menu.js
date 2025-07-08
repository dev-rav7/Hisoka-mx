

const fs = require('fs');
const config = require('../settings');
const { ven, commands } = require('../hisoka');
const axios = require('axios');

ven({
    pattern: "menu",
    react: "🤖",
    alias: ["allmenu"],
    desc: "Get command list",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, pushname, reply
}) => {
    try {
        let menu = {
            download: '', group: '', fun: '', owner: '',
            ai: '', anime: '', convert: '', reaction: '',
            main: '', other: ''
        };

        for (let i = 0; i < commands.length; i++) {
            let cmd = commands[i];
            if (cmd.pattern && !cmd.dontAddCommandList && menu.hasOwnProperty(cmd.category)) {
                menu[cmd.category] += `│ ⬡ ${cmd.pattern}\n`;
            }
        }

        let madeMenu = `
┏━━━━━❰ 『 ${config.BOT_NAME} 』  ❱━━━━━┓

   𝙃𝙚𝙮, 𝙩𝙧𝙖𝙫𝙚𝙡𝙚𝙧 *${pushname}*...  
   𝙃𝙚𝙧𝙚’𝙨 𝙮𝙤𝙪𝙧 𝙢𝙖𝙥 𝙩𝙤 𝙩𝙝𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨 𝙤𝙛 𝙩𝙝𝙚 𝙬𝙤𝙧𝙡𝙙.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 𝙐𝙨𝙚𝙧: ${pushname}  
🌐 𝙈𝙤𝙙𝙚: [${config.MODE}]  
✨ 𝙋𝙧𝙚𝙛𝙞𝙭: [${config.PREFIX}]  
📦 𝙏𝙤𝙩𝙖𝙡 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨: ${commands.length}  
📌 𝙑𝙚𝙧𝙨𝙞𝙤𝙣: ${config.version} BETA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【 ✦ 】 🛠️ 𝘼𝙙𝙢𝙞𝙣 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨  
${menu.group || '│ (No commands found)'}  
${menu.main || ''}  
${menu.other || ''}  

【 ✧ 】 📥 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨  
${menu.download || '│ (No commands found)'}  

【 ✦ 】 👑 𝙊𝙬𝙣𝙚𝙧 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨  
${menu.owner || '│ (No commands found)'}  

【 ✧ 】 🧠 𝘼𝙄 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨  
${menu.ai || '│ (No commands found)'}  

【 ✦ 】 ✨ 𝙇𝙤𝙜𝙤/𝘼𝙣𝙞𝙢𝙚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨  
${menu.anime || '│ (No commands found)'}  

【 ✧ 】 🔄 𝘾𝙤𝙣𝙫𝙚𝙧𝙩 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨  
${menu.convert || '│ (No commands found)'}  

【 ✦ 】 🎭 𝙍𝙚𝙖𝙘𝙩𝙞𝙤𝙣 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨  
${menu.reaction || '│ (No commands found)'}  

【 ✧ 】 🎉 𝙁𝙪𝙣 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨  
${menu.fun || '│ (No commands found)'}  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> ${config.DESCRIPTION}

╰━═☆ 『 ${config.BOT_NAME} 』 𝙈𝙖𝙨𝙩𝙚𝙧 𝙤𝙛 𝙩𝙝𝙚 𝘾𝙤𝙙𝙚 ☆═━╯
`.trim();

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: madeMenu,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: 'null',
                        newsletterName: '𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});
