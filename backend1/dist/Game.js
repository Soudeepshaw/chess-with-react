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
            if (this.board.inCheck()) {
                this.notifyCheck();
            }
            if (this.board.isGameOver()) {
                this.notifyGameOver();
                return;
            }
            this.sendMoveToOpponent(socket, move);
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
    notifyGameOver() {
        const winner = this.board.turn() === "w" ? "black" : "white";
        this.player1.send(JSON.stringify({
            type: messages_1.GAME_OVER,
            payload: {
                winner
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.GAME_OVER,
            payload: {
                winner
            }
        }));
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
}
exports.Game = Game;
