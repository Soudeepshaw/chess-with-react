import { WebSocket } from "ws";
import {Chess} from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE,CHECK } from "./messages";
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
        if (this.board.inCheck()) {
            this.notifyCheck();
        }

        if (this.board.isGameOver()) {
            this.notifyGameOver();
            return;
        }

        this.sendMoveToOpponent(socket, move);
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
notifyGameOver() {
    const winner = this.board.turn() === "w" ? "black" : "white";
    this.player1.send(JSON.stringify({
        type: GAME_OVER,
        payload: {
            winner
        }
    }));
    this.player2.send(JSON.stringify({
        type: GAME_OVER,
        payload: {
            winner
        }
    }));
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
}