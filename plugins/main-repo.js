const fetch = require('node-fetch');
const config = require('../config');    
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch information about a GitHub repository.",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/hhhisoka-bot/Hisoka-mx';

    try {
        // Extract username and repo name from the URL
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);

        // Fetch repository details using GitHub API
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API request failed with status ${response.status}`);
        }

        const repoData = await response.json();

        // Format the repository information
        const formattedInfo = `╔══ 🎯 *${repoData.name}* ══╗
╟─ 👤 Owner: *${repoData.owner.login}*
╟─ ⭐ Stars: *${repoData.stargazers_count}*
╟─ 🍴 Forks: *${repoData.forks_count}*
╟─ 🔗 Link: ${repoData.html_url}
╟─ 📝 Desc: ${repoData.description || 'No description'}
╚════════════════════╝

⭐ *Star & Fork to support!*
🔧 Powered by: *『𝙒𝘼・𝙃𝙄𝙎・𝙑𝟭』*
`;

        // Send an image with the formatted info as a caption and context info
        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/adymbp.jpg` },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363400575205721@newsletter',
                    newsletterName: '𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Send the audio file with context info
        
    } catch (error) {
        console.error("Error in repo command:", error);
        reply("Sorry, something went wrong while fetching the repository information. Please try again later.");
    }
});
