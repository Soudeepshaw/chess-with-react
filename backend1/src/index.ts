import { WebSocketServer } from "ws";
import { GameManager } from "./Gamemanager";
import * as https from 'https';
import express from 'express';
import cors from 'cors';

const port =8080;

const app = express();
const server = https.createServer(app);
const ws = new WebSocketServer({ server });

const corsOptions = {
  origin: 'https://chess-with-react-frontend.onrender.com',
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions));

const gameManager = new GameManager();

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

server.listen(port, () => {
    console.log(`WebSocket server is running on wss://0.0.0.0:${port}/`);
});
