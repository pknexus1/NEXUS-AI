const config = require('../config');
const { cmd } = require('../command');
const TicTacToe = require('../lib/tictactoe');

const games = {}; // Store active games

// 🎮 Start or Join Game
cmd({
    pattern: "ttt",
    desc: "Play TicTacToe game.",
    category: "games",
    use: '.ttt [room name]',
    react: "🎮",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, reply }) => {
    const text = args.join(" ");

    // Check if player is already in a game
    if (Object.values(games).find(room =>
        room.id.startsWith('tictactoe') &&
        [room.game.playerX, room.game.playerO].includes(sender)
    )) {
        return reply('⚠️ You are already in a game. Type *surrender* to quit.');
    }

    // Look for an open room
    let room = Object.values(games).find(room =>
        room.state === 'WAITING' &&
        (text ? room.name === text : true)
    );

    if (room) {
        // Join as O
        room.o = from;
        room.game.playerO = sender;
        room.state = 'PLAYING';

        const arr = renderBoard(room.game);
        const str = `
🎮 *TicTacToe Game Started!*

Turn: @${room.game.currentTurn.split('@')[0]}

${arr}

▢ *Room ID:* ${room.id}
▢ Make 3 in a row to win.
▢ Type number (1-9) to play.
▢ Type *surrender* to quit.
        `;

        await conn.sendMessage(from, {
            text: str,
            mentions: [room.game.playerX, room.game.playerO]
        });

    } else {
        // Create a new room
        room = {
            id: 'tictactoe-' + (+new Date),
            x: from,
            o: '',
            game: new TicTacToe(sender, 'o'),
            state: 'WAITING'
        };
        if (text) room.name = text;

        games[room.id] = room;
        reply(`⏳ Waiting for opponent...\nType *.ttt ${text || ''}* to join.`);
    }
});

// 🎯 Handle Moves
cmd({
    pattern: "^[1-9]$",
    desc: "Make a TicTacToe move.",
    category: "games",
    filename: __filename
}, async (conn, mek, m, { from, sender, body, reply }) => {
    const room = findPlayerGame(sender);
    if (!room || room.state !== 'PLAYING') return;

    if (sender !== room.game.currentTurn) {
        return reply('❌ Not your turn!');
    }

    const ok = room.game.turn(sender === room.game.playerO, parseInt(body) - 1);
    if (!ok) return reply('❌ Invalid move! Spot taken.');

    await updateGameBoard(conn, room);
});

// 🏳️ Surrender
cmd({
    pattern: "surrender",
    desc: "Quit TicTacToe game.",
    category: "games",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    const room = findPlayerGame(sender);
    if (!room) return reply('⚠️ You are not in a game.');

    const winner = sender === room.game.playerX ? room.game.playerO : room.game.playerX;
    await conn.sendMessage(from, {
        text: `🏳️ @${sender.split('@')[0]} surrendered! @${winner.split('@')[0]} wins!`,
        mentions: [sender, winner]
    });

    delete games[room.id];
});

// Helper: Render Board
function renderBoard(game) {
    const symbols = {
        'X': '❎',
        'O': '⭕',
        '1': '1️⃣',
        '2': '2️⃣',
        '3': '3️⃣',
        '4': '4️⃣',
        '5': '5️⃣',
        '6': '6️⃣',
        '7': '7️⃣',
        '8': '8️⃣',
        '9': '9️⃣'
    };
    const arr = game.render().map(v => symbols[v]);
    return `${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}`;
}

// Helper: Find Player Game
function findPlayerGame(sender) {
    return Object.values(games).find(room =>
        room.id.startsWith('tictactoe') &&
        [room.game.playerX, room.game.playerO].includes(sender)
    );
}

// Helper: Update Game Board
async function updateGameBoard(conn, room) {
    const arr = renderBoard(room.game);
    let winner = room.game.winner;
    let isTie = room.game.turns === 9;

    let gameStatus = winner
        ? `🎉 @${winner.split('@')[0]} wins!`
        : isTie
            ? `🤝 It's a draw!`
            : `🎲 Turn: @${room.game.currentTurn.split('@')[0]}`;

    await conn.sendMessage(room.x, {
        text: `
🎮 *TicTacToe Game*

${gameStatus}

${arr}

❎: @${room.game.playerX.split('@')[0]}
⭕: @${room.game.playerO.split('@')[0]}

${!winner && !isTie ? 'Type a number (1-9) to play\nType *surrender* to quit' : ''}
        `.trim(),
        mentions: [room.game.playerX, room.game.playerO]
    });

    if (winner || isTie) {
        delete games[room.id];
    }
                                  }
        
