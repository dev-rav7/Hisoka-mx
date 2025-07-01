const { isAdmin } = require('../lib/isAdmin');

// Function to handle manual promotions via command
async function promoteCommand(sock, chatId, mentionedJids, message) {
    let userToPromote = [];
    
    // Check for mentioned users
    if (mentionedJids && mentionedJids.length > 0) {
        userToPromote = mentionedJids;
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    // If no user found through either method
    if (userToPromote.length === 0) {
        await sock.sendMessage(chatId, { 
            text: 'Please mention the user or reply to their message to promote!'
        });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");
        
        // Get usernames for each promoted user
        const usernames = await Promise.all(userToPromote.map(async jid => {
            
            return `@${jid.split('@')[0]}`;
        }));

        // Get promoter's name (the bot user in this case)
        const promoterJid = sock.user.id;
        
        const promotionMessage = `*🃏『 𝙋𝙍𝙊𝙈𝙊𝙏𝙄𝙊𝙉 𝘽𝙔 『𝙒𝘼・𝙃𝙄𝙎・𝙑𝟭』 』🃏*\n\n` +
  `🔮 *Chosen ${userToPromote.length > 1 ? 'Souls' : 'Soul'}:*\n` +
  `${usernames.map(name => `🎭 ${name}`).join('\n')}\n\n` +
  `🧠 *Elevated by:* @${promoterJid.split('@')[0]}\n` +
  `⏳ *Moment Seized:* ${new Date().toLocaleString()}\n\n` +
  `❝ *Power... is so thrilling, don’t you think?* ❞\n` +
  `— 𝘏𝘪𝘴𝘰𝘬𝘢`;
        await sock.sendMessage(chatId, { 
            text: promotionMessage,
            mentions: [...userToPromote, promoterJid]
        });
    } catch (error) {
        console.error('Error in promote command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to promote user(s)!'});
    }
}

// Function to handle automatic promotion detection
async function handlePromotionEvent(sock, groupId, participants, author) {
    try {
       /* console.log('Promotion Event Data:', {
            groupId,
            participants,
            author
        });*/

        // Get usernames for promoted participants
        const promotedUsernames = await Promise.all(participants.map(async jid => {
            return `@${jid.split('@')[0]} `;
        }));

        let promotedBy;
        let mentionList = [...participants];

        if (author && author.length > 0) {
            // Ensure author has the correct format
            const authorJid = author;
            promotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            promotedBy = 'System';
        }

       const promotionMessage = `*🃏『 『𝙒𝘼・𝙃𝙄𝙎・𝙑𝟭』 𝘾𝙃𝙊𝙄𝘾𝙀 』🃏*\n\n` +
  `🎭 *Promoted Soul${participants.length > 1 ? 's' : ''}:*\n` +
  `${promotedUsernames.map(name => `🔸 ${name}`).join('\n')}\n\n` +
  `🧠 *Ascended By:* ${promotedBy}\n` +
  `⏳ *Time of Awakening:* ${new Date().toLocaleString()}\n\n` +
  `❝ *A new game begins... Let's see how long they survive.* ❞\n` +
  `— 𝘏𝘪𝘴𝘰𝘬𝘢`;
        
        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling promotion event:', error);
    }
}

module.exports = { promoteCommand, handlePromotionEvent };
