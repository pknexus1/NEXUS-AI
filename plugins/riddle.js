const config = require('../config');
const { cmd, commands } = require('../command');

// Expanded riddle database (50+ riddles)
const riddles = [
    // Easy Riddles
    {
        question: "What has to be broken before you can use it?",
        answer: "egg",
        hints: ["Found in kitchens", "Chickens produce them"],
        level: "easy"
    },
    {
        question: "I'm light as a feather, yet the strongest person can't hold me for more than 5 minutes. What am I?",
        answer: "breath",
        hints: ["Essential for life", "You do it unconsciously"],
        level: "easy"
    },
    {
        question: "What gets wet while drying?",
        answer: "towel",
        hints: ["Bathroom item", "Used after showering"],
        level: "easy"
    },

    // Medium Riddles
    {
        question: "What has cities but no houses, forests but no trees, and water but no fish?",
        answer: "map",
        hints: ["Used for navigation", "Paper version needs folding"],
        level: "medium"
    },
    {
        question: "What goes up but never comes down?",
        answer: "age",
        hints: ["Increases yearly", "Celebrated on birthdays"],
        level: "medium"
    },
    {
        question: "The more you take, the more you leave behind. What am I?",
        answer: "footsteps",
        hints: ["Related to walking", "You create them as you move"],
        level: "medium"
    },

    // Hard Riddles
    {
        question: "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?",
        answer: "river",
        hints: ["Contains water", "Flows downstream"],
        level: "hard"
    },
    {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo",
        hints: ["Acoustic phenomenon", "Repeats sounds"],
        level: "hard"
    },
    {
        question: "What has keys but can't open locks, has space but no room, and you can enter but not go inside?",
        answer: "keyboard",
        hints: ["Computer peripheral", "Contains letters and numbers"],
        level: "hard"
    },

    // Nature-Themed Riddles
    {
        question: "What falls but never breaks, and what breaks but never falls?",
        answer: "night and day",
        hints: ["Daily cycles", "Opposites"],
        level: "medium"
    },
    {
        question: "I'm tall when I'm young and short when I'm old. What am I?",
        answer: "candle",
        hints: ["Produces light", "Waxes melt"],
        level: "easy"
    },

    // Wordplay Riddles
    {
        question: "What word is pronounced the same if you take away four of its five letters?",
        answer: "queue",
        hints: ["Waiting line", "Starts with Q"],
        level: "hard"
    },
    {
        question: "What 5-letter word becomes shorter when you add two letters to it?",
        answer: "short",
        hints: ["Opposite of long", "Add 'er' to compare"],
        level: "medium"
    },

    // Classic Riddles
    {
        question: "What belongs to you but others use it more than you do?",
        answer: "name",
        hints: ["Personal identifier", "Given at birth"],
        level: "easy"
    },
    {
        question: "What has hands but can't clap?",
        answer: "clock",
        hints: ["Tells time", "Has numbers"],
        level: "easy"
    },

    // Challenging Riddles
    {
        question: "What can you hold in your right hand but never in your left hand?",
        answer: "left elbow",
        hints: ["Body part", "Self-referential"],
        level: "hard"
    },
    {
        question: "What gets bigger the more you take away from it?",
        answer: "hole",
        hints: ["Empty space", "Digging creates one"],
        level: "medium"
    }
];

// Game state tracker
const activeRiddles = new Map();

cmd({
    pattern: "riddle",
    alias: ["puzzle", "brainteaser"],
    use: '.riddle [easy/medium/hard]',
    desc: "Start a riddle game with optional difficulty",
    category: "game",
    react: "🧩",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, args }) => {
    try {
        // Check if user already has active riddle
        if (activeRiddles.has(sender)) {
            return reply("❌ Finish your current riddle first! (Answer or wait for timeout)");
        }

        // Filter by difficulty if specified
        let filteredRiddles = riddles;
        const difficulty = args[0]?.toLowerCase();
        if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
            filteredRiddles = riddles.filter(r => r.level === difficulty);
            if (filteredRiddles.length === 0) {
                return reply(`❌ No ${difficulty} riddles available. Using random instead.`);
            }
        }

        // Select random riddle
        const riddle = filteredRiddles[Math.floor(Math.random() * filteredRiddles.length)];
        
        // Store riddle info
        activeRiddles.set(sender, {
            answer: riddle.answer.toLowerCase(),
            hints: riddle.hints,
            attempts: 0,
            timestamp: Date.now(),
            level: riddle.level
        });

        // Send riddle question
        await conn.sendMessage(from, {
            text: `🧩 *${riddle.level.toUpperCase()} Riddle*\n\n${riddle.question}\n\nYou have 90 seconds to answer!`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "pk-tech",
                    serverMessageId: 159
                }
            }
        }, { quoted: mek });

        // Set timeout for answer reveal (90 seconds)
        setTimeout(async () => {
            if (activeRiddles.has(sender)) {
                const riddleData = activeRiddles.get(sender);
                activeRiddles.delete(sender);
                
                await reply(`⏰ Time's up! The answer was: *${riddleData.answer}*`);
            }
        }, 90000);

    } catch (e) {
        console.error("Riddle error:", e);
        reply(`❌ Failed to start riddle game: ${e.message}`);
    }
});

// Answer checker (modified to handle multi-word answers)
cmd({
    on: "text",
    fromMe: false
},
async (conn, mek, m, { from, sender, body }) => {
    try {
        if (!activeRiddles.has(sender)) return;

        const riddleData = activeRiddles.get(sender);
        const userAnswer = body.trim().toLowerCase().replace(/[^a-z ]/g, '');
        const correctAnswer = riddleData.answer;

        // Flexible answer checking
        const isCorrect = 
            userAnswer === correctAnswer ||
            userAnswer.replace(/\s+/g, '') === correctAnswer.replace(/\s+/g, '') ||
            correctAnswer.split(' ').some(word => userAnswer.includes(word));

        if (isCorrect) {
            activeRiddles.delete(sender);
            await conn.sendMessage(from, {
                text: `🎉 *Correct!* The answer was: *${correctAnswer}*\n\nDifficulty: ${riddleData.level.toUpperCase()}`,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363288304618280@newsletter',
                        newsletterName: "pk-tech",
                        serverMessageId: 160
                    }
                }
            }, { quoted: mek });
        } else {
            riddleData.attempts++;
            
            // Progressive hint system
            if (riddleData.attempts === 2) {
                await conn.sendMessage(from, {
                    text: `💡 *Hint #1:* ${riddleData.hints[0]}`,
                    mentions: [sender]
                });
            } 
            else if (riddleData.attempts === 4) {
                await conn.sendMessage(from, {
                    text: `💡 *Hint #2:* ${riddleData.hints[1] || riddleData.hints[0]}`,
                    mentions: [sender]
                });
            }
            else if (riddleData.attempts >= 6) {
                activeRiddles.delete(sender);
                await conn.sendMessage(from, {
                    text: `❌ The answer was: *${correctAnswer}*\n\nBetter luck next time!`,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363288304618280@newsletter',
                            newsletterName: "pk-tech",
                            serverMessageId: 161
                        }
                    }
                }, { quoted: mek });
            }
        }
    } catch (e) {
        console.error("Riddle answer check error:", e);
    }
});
