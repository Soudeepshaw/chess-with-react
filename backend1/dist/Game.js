"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.moveCount = 0;
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black"
            }
        }));
        this.sendChatMessage(this.player1, "Game started. Good luck!");
    }
    makeMove(socket, move) {
        const playerColor = (socket === this.player1) ? 'white' : 'black';
        if ((this.board.turn() === 'w' && playerColor !== 'white') || (this.board.turn() === 'b' && playerColor !== 'black')) {
            console.log("It's not your turn!");
            return;
        }
        try {
            const result = this.board.move(move);
            if (!result) {
                console.log("Invalid move:", move);
                return;
            }
            this.sendMoveToOpponent(socket, move);
            setTimeout(() => {
                if (this.board.isGameOver()) {
                    const winner = this.board.turn() === "w" ? "black" : "white";
                    this.notifyGameOver(winner);
                }
                else if (this.board.inCheck()) {
                    this.notifyCheck();
                }
            }, 1000);
            this.moveCount++;
        }
        catch (err) {
            console.log("Error making move:", err);
        }
    }
    notifyCheck() {
        const currentTurn = this.board.turn() === "w" ? "white" : "black";
        this.player1.send(JSON.stringify({
            type: messages_1.CHECK,
            payload: {
                color: currentTurn
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.CHECK,
            payload: {
                color: currentTurn
            }
        }));
    }
    handlePlayerLeft(socket) {
        const winner = socket === this.player1 ? "black" : "white";
        const remainingPlayer = socket === this.player1 ? this.player2 : this.player1;
        remainingPlayer.send(JSON.stringify({
            type: messages_1.PLAYER_LEFT,
            payload: {
                winner
            }
        }));
        this.notifyGameOver(winner);
    }
    notifyGameOver(winner) {
        const gameOverMessage = JSON.stringify({
            type: messages_1.GAME_OVER,
            payload: {
                winner
            }
        });
        this.player1.send(gameOverMessage);
        this.player2.send(gameOverMessage);
    }
    sendMoveToOpponent(socket, move) {
        const message = JSON.stringify({
            type: messages_1.MOVE,
            payload: move
        });
        if (socket === this.player1) {
            this.player2.send(message);
        }
        else {
            this.player1.send(message);
        }
    }
    sendChatMessage(socket, message) {
        const sender = socket === this.player1 ? "white" : "black";
        const chatMessage = JSON.stringify({
            type: messages_1.CHAT_MESSAGE,
            payload: {
                sender,
                message
            }
        });
        this.player1.send(chatMessage);
        this.player2.send(chatMessage);
    }
}
exports.Game = Game;
