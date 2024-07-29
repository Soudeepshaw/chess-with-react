import { WebSocket } from "ws";
import {Chess} from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE,CHECK , CHAT_MESSAGE,PLAYER_LEFT} from "./messages";
export class Game {
    public player1:WebSocket;
    public player2:WebSocket;
    public board:Chess;
    private moveCount:number;
    private startTime:Date;
    constructor(player1:WebSocket,player2:WebSocket){
        this.player1 = player1;
        this.player2 = player2;
        this.board=new Chess();
        this.moveCount = 0; 
        this.startTime=new Date();
        this.player1.send(JSON.stringify({
            type:INIT_GAME, 
            payload:
            {
                color:"white"
            }
        }))
        this.player2.send(JSON.stringify({
            type:INIT_GAME,
            payload:
            {
                color:"black"
                }
        }))
        this.sendChatMessage(this.player1, "Game started. Good luck!");
    }
    makeMove(socket:WebSocket,move:{from:string;to:string;}){
        const playerColor = (socket === this.player1) ? 'white' : 'black';
        if ((this.board.turn() === 'w' && playerColor !== 'white') || (this.board.turn() === 'b' && playerColor !== 'black')) {
            console.log("It's not your turn!");
            return;
        }
        
    
    try{
        const result=this.board.move(move);
        if(!result){
            console.log("Invalid move:", move);
                return;
        }

        this.sendMoveToOpponent(socket, move);
        setTimeout(() => {
            if (this.board.isGameOver()) {
                const winner = this.board.turn() === "w" ? "black" : "white";
                this.notifyGameOver(winner);
            } else if (this.board.inCheck()) {
                this.notifyCheck();
            }
        }, 1000);
        this.moveCount++;
    } catch (err) {
        console.log("Error making move:", err);
    }
}
notifyCheck() {
    const currentTurn = this.board.turn() === "w" ? "white" : "black";
    this.player1.send(JSON.stringify({
        type: CHECK,
        payload: {
            color: currentTurn
        }
    }));
    this.player2.send(JSON.stringify({
        type: CHECK,
        payload: {
            color: currentTurn
        }
    }));
}
handlePlayerLeft(socket: WebSocket) {
    const winner = socket === this.player1 ? "black" : "white";
    const remainingPlayer = socket === this.player1 ? this.player2 : this.player1;

    remainingPlayer.send(JSON.stringify({
        type: PLAYER_LEFT,
        payload: {
            winner
        }
    }));

    this.notifyGameOver(winner);
}

notifyGameOver(winner: string) {
    const gameOverMessage = JSON.stringify({
        type: GAME_OVER,
        payload: {
            winner
        }
    });

    this.player1.send(gameOverMessage);
    this.player2.send(gameOverMessage);
}
sendMoveToOpponent(socket: WebSocket, move: { from: string; to: string }) {
    const message = JSON.stringify({
        type: MOVE,
        payload: move
    });

    if (socket === this.player1) {
        this.player2.send(message);
    } else {
        this.player1.send(message);
    }
}
sendChatMessage(socket: WebSocket, message: string) {
    const sender = socket === this.player1 ? "white" : "black";
    const chatMessage = JSON.stringify({
        type: CHAT_MESSAGE,
        payload: {
            sender,
            message
        }
    });

    this.player1.send(chatMessage);
    this.player2.send(chatMessage);
}

}