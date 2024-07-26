import { WebSocketServer } from "ws";
import { GameManager } from "./Gamemanager";

const port = 8080;
const ws=new WebSocketServer({port});
const gameManager=new GameManager();
ws.on('connection', function connection(ws) {
    console.log("New client connected");
    gameManager.addUser(ws);
    ws.on("close",()=>{
        console.log("Client disconnected"); 
        gameManager.removeUser(ws)})

    
});
console.log(`WebSocket server is running on ws://localhost:${port}/`);
