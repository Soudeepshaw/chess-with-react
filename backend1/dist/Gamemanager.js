"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const messages_1 = require("./messages");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUsers = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    getGameByPlayer(socket) {
        return this.games.find(game => game.player1 === socket || game.player2 === socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
        const game = this.getGameByPlayer(socket);
        if (game) {
            game.handlePlayerLeft(socket);
            this.games = this.games.filter(g => g !== game);
        }
        if (this.pendingUsers === socket) {
            this.pendingUsers = null;
        }
    }
    addHandler(socket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingUsers) {
                    const game = new Game_1.Game(this.pendingUsers, socket);
                    this.games.push(game);
                    this.pendingUsers = null;
                }
                else {
                    this.pendingUsers = socket;
                }
            }
            if (message.type === messages_1.MOVE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.payload);
                }
            }
            if (message.type === messages_1.CHAT_MESSAGE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.sendChatMessage(socket, message.payload);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
