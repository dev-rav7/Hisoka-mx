const { setAntiBadword, getAntiBadword, removeAntiBadword, incrementWarningCount, resetWarningCount } = require('../lib/index');
const fs = require('fs');
const path = require('path');

// Load antibadword config
function loadAntibadwordConfig(groupId) {
    try {
        const configPath = path.join(__dirname, '../data/userGroupData.json');
        if (!fs.existsSync(configPath)) {
            return {};
        }
        const data = JSON.parse(fs.readFileSync(configPath));
        return data.antibadword?.[groupId] || {};
    } catch (error) {
        console.error('❌ Error loading antibadword config:', error.message);
        return {};
    }
}

async function handleAntiBadwordCommand(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `*ANTIBADWORD SETUP*\n\n*.antibadword on*\nTurn on antibadword\n\n*.antibadword set <action>*\nSet action: delete/kick/warn\n\n*.antibadword off*\nDisables antibadword in this group`
        });
    }

    if (match === 'on') {
        const existingConfig = await getAntiBadword(chatId, 'on');
        if (existingConfig?.enabled) {
            return sock.sendMessage(chatId, { text: '*AntiBadword is already enabled for this group*' });
        }
        await setAntiBadword(chatId, 'on', 'delete');
        return sock.sendMessage(chatId, { text: '*AntiBadword has been enabled. Use .antibadword set <action> to customize action*' });
    }

    if (match === 'off') {
        const config = await getAntiBadword(chatId, 'on');
        if (!config?.enabled) {
            return sock.sendMessage(chatId, { text: '*AntiBadword is already disabled for this group*' });
        }
        await removeAntiBadword(chatId);
        return sock.sendMessage(chatId, { text: '*AntiBadword has been disabled for this group*' });
    }

    if (match.startsWith('set')) {
        const action = match.split(' ')[1];
        if (!action || !['delete', 'kick', 'warn'].includes(action)) {
            return sock.sendMessage(chatId, { text: '*Invalid action. Choose: delete, kick, or warn*' });
        }
        await setAntiBadword(chatId, 'on', action);
        return sock.sendMessage(chatId, { text: `*AntiBadword action set to: ${action}*` });
    }

    return sock.sendMessage(chatId, { text: '*Invalid command. Use .antibadword to see usage*' });
}

async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    const config = loadAntibadwordConfig(chatId);
    if (!config.enabled) return;

    // Skip if not group
    if (!chatId.endsWith('@g.us')) return;

    // Skip if message is from bot
    if (message.key.fromMe) return;

    // Get antibadword config first
    const antiBadwordConfig = await getAntiBadword(chatId, 'on');
    if (!antiBadwordConfig?.enabled) {
        console.log('Antibadword not enabled for this group');
        return;
    }

    // Convert message to lowercase and clean it
    const cleanMessage = userMessage.toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Replace special chars with space
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .trim();

    // List of bad words
   const badWordsEN_FR = [
  ['gandu', 'jerk / enfoiré'],
  ['madarchod', 'motherfucker / enculé de ta mère'],
  ['bhosdike', 'sisterfucker / baiseur de sœur'],
  ['bsdk', 'bastard / bâtard'],
  ['fucker', 'fucker / baiseur'],
  ['bhosda', 'vulgar / chatte'],
  ['lauda', 'dick / bite'],
  ['laude', 'dicks / bites'],
  ['betichod', 'daughterfucker / baiseur de fille'],
  ['chutiya', 'idiot / connard'],
  ['maa ki chut', 'mother’s pussy / chatte de ta mère'],
  ['behenchod', 'sisterfucker / baiseur de sœur'],
  ['behen ki chut', 'sister’s pussy / chatte de ta sœur'],
  ['tatto ke saudagar', 'pubic hair seller / vendeur de poils pubiens'],
  ['machar ki jhant', 'mosquito’s pubes / poils de moustique'],
  ['jhant ka baal', 'pubic hair / poil de couille'],
  ['randi', 'whore / pute'],
  ['chuchi', 'boobs / nichons'],
  ['boobs', 'boobs / seins'],
  ['boobies', 'boobies / seins'],
  ['tits', 'tits / nichons'],
  ['idiot', 'idiot / idiot'],
  ['nigga', 'racial slur / insulte raciste'],
  ['fuck', 'fuck / baise'],
  ['dick', 'dick / bite'],
  ['bitch', 'bitch / salope'],
  ['bastard', 'bastard / bâtard'],
  ['asshole', 'asshole / trou du cul'],
  ['asu', 'slang / insulte vague'],
  ['awyu', 'slang / insulte vague'],
  ['teri ma ki chut', 'your mom’s pussy / chatte de ta mère'],
  ['teri maa ki', 'your mother’s / ta mère...'],
  ['lund', 'dick / bite'],
  ['lund ke baal', 'dick hair / poils de bite'],
  ['mc', 'motherfucker / enculé de mère'],
  ['lodu', 'loser / tocard'],
  ['benchod', 'sisterfucker / baiseur de sœur'],

  // General offensive
  ['shit', 'shit / merde'],
  ['damn', 'damn / putain'],
  ['hell', 'hell / enfer'],
  ['piss', 'piss / pisse'],
  ['crap', 'crap / merde'],
  ['slut', 'slut / traînée'],
  ['whore', 'whore / pute'],
  ['prick', 'prick / connard'],
  ['motherfucker', 'motherfucker / fils de pute'],
  ['cock', 'cock / queue'],
  ['cunt', 'cunt / conne / chatte'],
  ['pussy', 'pussy / chatte'],
  ['twat', 'twat / abruti / con'],
  ['wanker', 'wanker / branleur'],
  ['douchebag', 'douchebag / connard'],
  ['jackass', 'jackass / abruti'],
  ['moron', 'moron / crétin'],
  ['retard', 'retard / attardé'],
  ['scumbag', 'scumbag / ordure'],
  ['skank', 'skank / traînée'],
  ['slutty', 'slutty / salope'],
  ['arse', 'arse / cul'],
  ['bugger', 'bugger / enculé'],
  ['sod off', 'go away / va te faire foutre'],

  // Autres hindi
  ['chut', 'pussy / chatte'],
  ['laude ka baal', 'dick hair / poil de bite'],
  ['madar', 'short for madarchod / enculé de mère'],
  ['behen ke lode', 'sister’s dick / la bite de ta sœur'],
  ['chodne', 'to fuck / baiser'],
  ['sala kutta', 'damn dog / sale chien'],
  ['harami', 'bastard / bâtard'],
  ['randi ki aulad', 'whore’s child / fils de pute'],
  ['gaand mara', 'got anal / s’est fait enculer'],
  ['chodu', 'fucker / baiseur'],
  ['lund le', 'take dick / prends ma bite'],
  ['gandu saala', 'jerk / enfoiré'],
  ['kameena', 'scoundrel / salaud'],
  ['haramzada', 'bastard / bâtard'],
  ['chamiya', 'cheap woman / traînée'],
  ['chodne wala', 'the one who fucks / baiseur'],
  ['chudai', 'sex act / acte sexuel'],
  ['chutiye ke baap', 'father of idiot / père du con'],

  // Codés / variantes
  ['fck', 'fuck / baise'],
  ['fckr', 'fucker / baiseur'],
  ['fcker', 'fucker / baiseur'],
  ['fuk', 'fuck / baise'],
  ['fukk', 'fuck / baise'],
  ['fcuk', 'fuck / baise'],
  ['btch', 'bitch / salope'],
  ['bch', 'bitch / salope'],
  ['f*ck', 'fuck / baise'],
  ['assclown', 'idiot / crétin'],
  ['a**hole', 'asshole / trou du cul'],
  ['f@ck', 'fuck / baise'],
  ['b!tch', 'bitch / salope'],
  ['d!ck', 'dick / bite'],
  ['n!gga', 'nigga / insulte raciste'],
  ['f***er', 'fucker / baiseur'],
  ['s***head', 'shithead / tête de merde'],
  ['a$$', 'ass / cul'],
  ['l0du', 'loser / crétin'],
  ['lund69', 'sexual / bite69'],

  // Racial slurs
  ['spic', 'latino slur / insulte raciste'],
  ['chink', 'asian slur / insulte asiatique'],
  ['cracker', 'white slur / insulte pour blanc'],
  ['towelhead', 'arab slur / insulte islamophobe'],
  ['gook', 'asian slur / insulte viet'],
  ['kike', 'jewish slur / insulte antisémite'],
  ['paki', 'pakistani slur / insulte pakistanaise'],
  ['honky', 'white slur / insulte raciste blanc'],
  ['wetback', 'mexican slur / clandestin'],
  ['raghead', 'muslim slur / porteur de turban'],
  ['jungle bunny', 'black slur / insulte anti-noir'],
  ['sand nigger', 'arab slur / très offensant'],
  ['beaner', 'latino slur / mexicain'],

  // NSFW
  ['blowjob', 'fellation'],
  ['handjob', 'branlette'],
  ['cum', 'sperme'],
  ['cumshot', 'éjaculation'],
  ['jizz', 'sperme'],
  ['deepthroat', 'gorge profonde'],
  ['fap', 'masturbation masculine'],
  ['hentai', 'hentai (japonais pornographique)'],
  ['MILF', 'mère sexy'],
  ['anal', 'anal'],
  ['orgasm', 'orgasme'],
  ['dildo', 'godemichet'],
  ['vibrator', 'vibromasseur'],
  ['gangbang', 'partouze'],
  ['threesome', 'plan à trois'],
  ['porn', 'porno'],
  ['sex', 'sexe'],
  ['xxx', 'porno'],

  // Homophobie
  ['fag', 'fag / tapette'],
  ['faggot', 'faggot / pédale'],
  ['dyke', 'dyke / gouine'],
  ['tranny', 'transphobic / transgenre péjoratif'],
  ['homo', 'homo / homosexuel péjoratif'],
  ['sissy', 'sissy / efféminé'],
  ['fairy', 'fairy / tapette'],
  ['lesbo', 'lesbo / lesbienne'],

  // Drogues
  ['weed', 'weed / cannabis'],
  ['pot', 'pot / herbe'],
  ['coke', 'cocaïne'],
  ['heroin', 'héroïne'],
  ['meth', 'méthamphétamine'],
  ['crack', 'crack'],
  ['dope', 'drogue'],
  ['bong', 'pipe à eau'],
  ['kush', 'variété de weed'],
  ['hash', 'haschich'],
  ['trip', 'trip / hallucination'],
  ['rolling', 'rouler / planer']
];
    // Split message into words
    const messageWords = cleanMessage.split(' ');
    let containsBadWord = false;

    // Check for exact word matches only
    for (const word of messageWords) {
        // Skip empty words or very short words
        if (word.length < 2) continue;

        // Check if this word exactly matches any bad word
        if (badWords.includes(word)) {
            containsBadWord = true;
            break;
        }

        // Also check for multi-word bad words
        for (const badWord of badWords) {
            if (badWord.includes(' ')) {  // Multi-word bad phrase
                if (cleanMessage.includes(badWord)) {
                    containsBadWord = true;
                    break;
                }
            }
        }
        if (containsBadWord) break;
    }

    if (!containsBadWord) return;

   // console.log('Bad word detected in:', userMessage);

    // Check if bot is admin before taking action
    const groupMetadata = await sock.groupMetadata(chatId);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = groupMetadata.participants.find(p => p.id === botId);
    if (!bot?.admin) {
       // console.log('Bot is not admin, cannot take action');
        return;
    }

    // Check if sender is admin
    const participant = groupMetadata.participants.find(p => p.id === senderId);
    if (participant?.admin) {
        //console.log('Sender is admin, skipping action');
        return;
    }

    // Delete message immediately
    try {
        await sock.sendMessage(chatId, { 
            delete: message.key
        });
        //console.log('Message deleted successfully');
    } catch (err) {
        console.error('Error deleting message:', err);
        return;
    }

    // Take action based on config
    switch (antiBadwordConfig.action) {
        case 'delete':
            await sock.sendMessage(chatId, {
                text: `*@${senderId.split('@')[0]} bad words are not allowed here*`,
                mentions: [senderId]
            });
            break;

        case 'kick':
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `*@${senderId.split('@')[0]} has been kicked for using bad words*`,
                    mentions: [senderId]
                });
            } catch (error) {
                console.error('Error kicking user:', error);
            }
            break;

        case 'warn':
            const warningCount = await incrementWarningCount(chatId, senderId);
            if (warningCount >= 3) {
                try {
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    await resetWarningCount(chatId, senderId);
                    await sock.sendMessage(chatId, {
                        text: `*@${senderId.split('@')[0]} has been kicked after 3 warnings*`,
                        mentions: [senderId]
                    });
                } catch (error) {
                    console.error('Error kicking user after warnings:', error);
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: `*@${senderId.split('@')[0]} warning ${warningCount}/3 for using bad words*`,
                    mentions: [senderId]
                });
            }
            break;
    }
}

module.exports = {
    handleAntiBadwordCommand,
    handleBadwordDetection
}; 