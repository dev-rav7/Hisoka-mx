
const { ven } = require('../hisoka');
const config = require('../settings');

// Stockage des jeux actifs
let activeGames = {};

ven({
    pattern: 'quiz',
    desc: 'Démarrer un quiz',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply, groupName, pushname }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        
        if (activeGames[from]) {
            return reply("❌ Un jeu est déjà en cours ! Terminez-le d'abord avec `.endgame`");
        }

        const quizQuestions = [
            {
                question: "🌍 Quelle est la capitale de la France ?",
                options: ["A) Madrid", "B) Paris", "C) Rome", "D) Londres"],
                answer: "B",
                correct: "Paris"
            },
            {
                question: "🔢 Combien font 25 + 17 ?",
                options: ["A) 42", "B) 41", "C) 43", "D) 44"],
                answer: "A",
                correct: "42"
            },
            {
                question: "🎵 Qui a écrit 'Romeo et Juliette' ?",
                options: ["A) Charles Dickens", "B) Victor Hugo", "C) William Shakespeare", "D) Molière"],
                answer: "C",
                correct: "William Shakespeare"
            },
            {
                question: "🌊 Quel est le plus grand océan du monde ?",
                options: ["A) Atlantique", "B) Indien", "C) Arctique", "D) Pacifique"],
                answer: "D",
                correct: "Pacifique"
            },
            {
                question: "🦁 Quel animal est surnommé le 'roi de la jungle' ?",
                options: ["A) Tigre", "B) Éléphant", "C) Lion", "D) Gorille"],
                answer: "C",
                correct: "Lion"
            }
        ];

        const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
        
        activeGames[from] = {
            type: 'quiz',
            question: randomQuestion,
            startTime: Date.now(),
            participants: {},
            startedBy: pushname
        };

        const quizMessage = `
🎯 *QUIZ DÉMARRÉ !*

📌 **Groupe:** ${groupName}
🎮 **Démarré par:** ${pushname}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${randomQuestion.question}

${randomQuestion.options.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 *Répondez avec la lettre (A, B, C, ou D)*
⏰ *Vous avez 30 secondes !*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { text: quizMessage });

        // Timer pour terminer le quiz
        setTimeout(async () => {
            if (activeGames[from] && activeGames[from].type === 'quiz') {
                const game = activeGames[from];
                const winners = Object.entries(game.participants)
                    .filter(([user, answer]) => answer === game.question.answer)
                    .map(([user]) => user);

                let resultMessage = `
⏰ *TEMPS ÉCOULÉ !*

✅ **Bonne réponse:** ${game.question.answer}) ${game.question.correct}

`;

                if (winners.length > 0) {
                    resultMessage += `🏆 **Gagnants:**\n`;
                    winners.forEach(winner => {
                        const winnerName = winner.split('@')[0];
                        resultMessage += `• @${winnerName}\n`;
                    });
                } else {
                    resultMessage += `😢 **Aucun gagnant cette fois !**\n`;
                }

                resultMessage += `\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

                await conn.sendMessage(from, { 
                    text: resultMessage,
                    mentions: winners
                });

                delete activeGames[from];
            }
        }, 30000);
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors du démarrage du quiz !");
    }
});

ven({
    pattern: 'riddle',
    desc: 'Démarrer une devinette',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, groupName, pushname }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        
        if (activeGames[from]) {
            return reply("❌ Un jeu est déjà en cours ! Terminez-le d'abord avec `.endgame`");
        }

        const riddles = [
            {
                question: "🤔 Je suis toujours devant toi mais tu ne peux jamais me voir. Que suis-je ?",
                answer: "avenir",
                hint: "C'est ce qui vient après le présent"
            },
            {
                question: "🏠 J'ai des clés mais pas de serrures. J'ai de l'espace mais pas de pièces. Que suis-je ?",
                answer: "clavier",
                hint: "Tu l'utilises pour taper"
            },
            {
                question: "💡 Plus j'ai de trous, plus je suis fort. Que suis-je ?",
                answer: "filet",
                hint: "Les pêcheurs l'utilisent"
            },
            {
                question: "🌙 Je grandis la nuit et disparais le jour. Que suis-je ?",
                answer: "etoiles",
                hint: "Elles brillent dans le ciel"
            }
        ];

        const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
        
        activeGames[from] = {
            type: 'riddle',
            riddle: randomRiddle,
            startTime: Date.now(),
            participants: {},
            startedBy: pushname,
            hintGiven: false
        };

        const riddleMessage = `
🧩 *DEVINETTE DÉMARRÉE !*

📌 **Groupe:** ${groupName}
🎮 **Démarré par:** ${pushname}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${randomRiddle.question}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 *Tapez votre réponse directement*
💡 *Indice disponible dans 15 secondes*
⏰ *Vous avez 45 secondes !*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}`;

        await conn.sendMessage(from, { text: riddleMessage });

        // Donner un indice après 15 secondes
        setTimeout(async () => {
            if (activeGames[from] && activeGames[from].type === 'riddle') {
                activeGames[from].hintGiven = true;
                await conn.sendMessage(from, { 
                    text: `💡 *INDICE:* ${randomRiddle.hint}` 
                });
            }
        }, 15000);

        // Timer pour terminer la devinette
        setTimeout(async () => {
            if (activeGames[from] && activeGames[from].type === 'riddle') {
                const game = activeGames[from];
                
                await conn.sendMessage(from, { 
                    text: `⏰ *TEMPS ÉCOULÉ !*\n\n✅ **Réponse:** ${game.riddle.answer}\n\n😢 **Personne n'a trouvé la bonne réponse !**\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}` 
                });

                delete activeGames[from];
            }
        }, 45000);
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors du démarrage de la devinette !");
    }
});

ven({
    pattern: 'endgame',
    desc: 'Terminer le jeu en cours',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply, pushname }) => {
    try {
        if (!isGroup) return reply("❌ Cette commande est réservée aux groupes !");
        
        if (!activeGames[from]) {
            return reply("❌ Aucun jeu en cours !");
        }

        const game = activeGames[from];
        if (game.startedBy !== pushname) {
            return reply("❌ Seul celui qui a démarré le jeu peut le terminer !");
        }

        await conn.sendMessage(from, { 
            text: `🛑 *JEU TERMINÉ*\n\n🎮 **Terminé par:** ${pushname}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.BOT_NAME}` 
        });

        delete activeGames[from];
        
    } catch (err) {
        console.error(err);
        reply("❌ Erreur lors de la terminaison du jeu !");
    }
});

// Intercepter les réponses aux jeux
ven({
    on: "body"
}, async (conn, mek, m, { from, body, sender, isGroup, pushname }) => {
    try {
        if (!isGroup || !activeGames[from]) return;

        const game = activeGames[from];
        const answer = body.toLowerCase().trim();

        if (game.type === 'quiz') {
            if (['a', 'b', 'c', 'd'].includes(answer)) {
                game.participants[sender] = answer.toUpperCase();
                
                if (answer.toUpperCase() === game.question.answer) {
                    await conn.sendMessage(from, { 
                        text: `🎉 *BONNE RÉPONSE !*\n\n@${sender.split('@')[0]} a trouvé la bonne réponse !\n\n✅ **Réponse:** ${game.question.answer}) ${game.question.correct}`,
                        mentions: [sender]
                    });
                    delete activeGames[from];
                }
            }
        } else if (game.type === 'riddle') {
            if (answer === game.riddle.answer.toLowerCase()) {
                await conn.sendMessage(from, { 
                    text: `🎉 *BRAVO !*\n\n@${sender.split('@')[0]} a trouvé la bonne réponse !\n\n✅ **Réponse:** ${game.riddle.answer}`,
                    mentions: [sender]
                });
                delete activeGames[from];
            }
        }
        
    } catch (err) {
        console.error(err);
    }
});
