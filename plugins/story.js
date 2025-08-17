const config = require('../config');
const { cmd, commands } = require('../command');

// Story database with different genres
const stories = [
    {
        title: "The Mysterious Key",
        content: `🔑 *The Mysterious Key*\n\nOne rainy evening, you find an old key buried in your backyard. It's strangely warm to the touch and glows faintly. The next morning, you discover a hidden door in your house that wasn't there before. The key fits perfectly...\n\n*To be continued* (Reply with 'next' to continue the story)`,
        genre: "mystery",
        parts: 3
    },
    {
        title: "The Last Pizza Slice",
        content: `🍕 *The Last Pizza Slice*\n\nIn a world where pizza is the currency, you're the last person who knows the secret recipe. The Pizza Mafia has been chasing you for years. Tonight, at midnight, you must deliver the recipe to the resistance... if you can trust them.\n\n*What will you do?* (Reply with 1 to trust them, 2 to run away)`,
        genre: "scifi",
        parts: 2
    },
    {
        title: "The Talking Dog",
        content: `🐶 *The Talking Dog*\n\nYour dog suddenly starts speaking perfect English. He claims to be an undercover agent from a parallel universe. He needs your help to stop an invasion of evil cats from taking over both worlds.\n\n*Will you help him?* (Reply with yes/no)`,
        genre: "comedy",
        parts: 1
    },
    {
        title: "The Cursed Painting",
        content: `🖼️ *The Cursed Painting*\n\nAt an antique shop, you buy a painting that changes slightly each night. The old woman in the portrait seems to be getting younger. Last night, she winked at you...\n\n*Do you keep it?* (Reply with keep/burn)`,
        genre: "horror",
        parts: 2
    },
    {
        title: "The Time Loop Cafe",
        content: `⏳ *The Time Loop Cafe*\n\nEvery morning at 7:15 AM, you wake up in the same cafe, reliving the same hour. The barista knows your name though you've never met. Today, she slips you a note: "Break the loop at 7:47."\n\n*Will you follow the note?*`,
        genre: "fantasy",
        parts: 3
    }
];

// Story continuation options
const storyContinuations = {
    "The Mysterious Key": {
        "next": [
            "You turn the key and the door creaks open, revealing a room frozen in time from the 1920s. A diary on the desk opens by itself to today's date... but written 100 years ago.",
            "As you step through, the door slams shut behind you. The air smells like lavender and old books. A whisper comes from the corner: 'I've been waiting for you...'"
        ]
    },
    "The Last Pizza Slice": {
        "1": "You hand over the recipe. Suddenly, the 'resistance' members remove their masks - they were Pizza Mafia all along! Game over.",
        "2": "You escape through the sewers, only to discover the real resistance hiding there. They help you create a pizza so delicious it ends the war!"
    },
    "The Talking Dog": {
        "yes": "You team up with your dog, disguising yourselves as mailmen to infiltrate the cat headquarters. The plan goes purr-fectly!",
        "no": "Your dog sighs and calls you a 'lazy human'. The next day, you wake up surrounded by cats... they don't look happy."
    }
};

// Track active stories
const activeStories = new Map();

cmd({
    pattern: "story",
    alias: ["tellstory", "randstory"],
    use: '.story [genre?]',
    desc: "Get a random interactive story\nGenres: mystery, scifi, comedy, horror, fantasy",
    category: "fun",
    react: "📖",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, args }) => {
    try {
        // Check if user has active story
        if (activeStories.has(sender)) {
            return reply("📖 Finish your current story first! (Reply to continue)");
        }

        // Filter by genre if specified
        let genre = args[0]?.toLowerCase();
        let filteredStories = stories;
        if (genre && ["mystery","scifi","comedy","horror","fantasy"].includes(genre)) {
            filteredStories = stories.filter(s => s.genre === genre);
        }

        // Select random story
        const story = filteredStories[Math.floor(Math.random() * filteredStories.length)];

        // Store story state
        activeStories.set(sender, {
            title: story.title,
            part: 1,
            maxParts: story.parts
        });

        // Send story
        await conn.sendMessage(from, {
            text: `📖 *${story.title}*\n\n${story.content}\n\nGenre: ${story.genre.charAt(0).toUpperCase() + story.genre.slice(1)}`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "pk-tech",
                    serverMessageId: 162
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Story error:", e);
        reply(`❌ Failed to generate story: ${e.message}`);
    }
});

// Story continuation handler
cmd({
    on: "text",
    fromMe: false
},
async (conn, mek, m, { from, sender, body }) => {
    try {
        if (!activeStories.has(sender)) return;

        const storyData = activeStories.get(sender);
        const userChoice = body.trim().toLowerCase();
        const continuations = storyContinuations[storyData.title];

        if (continuations && continuations[userChoice]) {
            // Send continuation if available
            await conn.sendMessage(from, {
                text: `📖 *${storyData.title} (Part ${storyData.part + 1})*\n\n${continuations[userChoice]}\n\n${storyData.part + 1 >= storyData.maxParts ? "✨ *The End*" : "Reply to continue..."}`,
                mentions: [sender]
            });

            if (storyData.part + 1 >= storyData.maxParts) {
                activeStories.delete(sender);
            } else {
                activeStories.set(sender, {
                    ...storyData,
                    part: storyData.part + 1
                });
            }
        }

    } catch (e) {
        console.error("Story continuation error:", e);
    }
});
