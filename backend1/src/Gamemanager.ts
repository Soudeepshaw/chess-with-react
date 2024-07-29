import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME,MOVE ,CHAT_MESSAGE} from "./messages";
export class GameManager{
    private games:Game[];
    private pendingUsers:WebSocket | null;
    private users:WebSocket[];
    constructor(){
        this.games=[];
        this.pendingUsers=null;
        this.users=[]
    }
    addUser(socket:WebSocket){
        this.users.push(socket);
        this.addHandler(socket)
    }
    getGameByPlayer(socket: WebSocket): Game | undefined {
        return this.games.find(game => game.player1 === socket || game.player2 === socket);
    }
    removeUser(socket:WebSocket){
        this.users=this.users.filter(user =>user !==socket)
        const game = this.getGameByPlayer(socket);
        if (game) {
            game.handlePlayerLeft(socket);
            this.games = this.games.filter(g => g !== game);
        }
        if (this.pendingUsers === socket) {
            this.pendingUsers = null;
        }
        
    }
    private addHandler(socket:WebSocket){
        socket.on('message',(data)=>{
            const message=JSON.parse(data.toString());
            if(message.type === INIT_GAME){
                if(this.pendingUsers){
                    const game=new Game(this.pendingUsers,socket);
                    this.games.push(game);
                    this.pendingUsers=null;

                }
                else{
                    this.pendingUsers=socket;
                }
            }
            if(message.type===MOVE){
                const game=this.games.find(game=>game.player1===socket || game.player2===socket);
                if (game){
                    game.makeMove(socket,message.payload);
                }
            }
            if (message.type === CHAT_MESSAGE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.sendChatMessage(socket, message.payload);
                }
            }
    })

    }
}