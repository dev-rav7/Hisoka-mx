const { ven } = require("../hisoka");  
const { sleep } = require("../lib/functions");  

ven({  
    pattern: "restart",  
    desc: "Restart 𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗",  
    category: "owner",  
    filename: __filename  
},  
async (conn, mek, m, { reply, isCreator }) => {  
    try {  
        if (!isCreator) {  
            return reply("Only the bot owner can use this command.");  
        }  

        const { exec } = require("child_process");  
        reply("Restarting...");  
        await sleep(1500);  
        exec("pm2 restart all");  
    } catch (e) {  
        console.error(e);  
        reply(`${e}`);  
    }  
});
