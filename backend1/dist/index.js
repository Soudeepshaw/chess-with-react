"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const Gamemanager_1 = require("./Gamemanager");
const port = 8080;
const ws = new ws_1.WebSocketServer({ port });
const gameManager = new Gamemanager_1.GameManager();
ws.on('connection', function connection(ws) {
    console.log("New client connected");
    gameManager.addUser(ws);
    ws.on("close", () => {
        console.log("Client disconnected");
        const game = gameManager.getGameByPlayer(ws);
        if (game) {
            game.handlePlayerLeft(ws);
        }
        gameManager.removeUser(ws);
    });
});
console.log(`WebSocket server is running on ws://localhost:${port}/`);
