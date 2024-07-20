import { Button } from "../Components/Button";
import { ChessBoard } from "../Components/ChessBoard";

import { useSocket } from "../Hooks/Usesocket";
import { useEffect, useState } from "react";
import { Chess, Square } from "chess.js";

import { GAME_OVER, INIT_GAME, MOVE } from "../MESSAGES/Messages";

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [color, setColor] = useState<string | null>(null);
    


    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message);
            switch (message.type) {
                case INIT_GAME:
                    const newGame = new Chess();
                    setChess(newGame);
                    setBoard(newGame.board());
                    setGameStarted(true);
                    setColor(message.payload.color); 
                    console.log("Game INITIALIZED");
                    break;
                case MOVE:
                    const move = message.payload;
                    try{
                        chess.move(move);
                        setBoard(chess.board());
                        console.log("Move Made");
                        
                    }
                    catch (error) {
                        console.error("Invalid move:", error); // Catch and log any errors
                    }
                    break
                case GAME_OVER:
                    alert("Game Over. Winner: " + message.payload.winner)
                    console.log("Game Over. Winner: " + message.payload.winner);
                    setGameStarted(false);
                    setColor(null); 
                    break;
                case "CHECK":
                    alert("Check")
                    console.log("Check")
                    break;
                default:
                    break;
            }
        };
        return () => {
            socket.onmessage = null; // Cleanup on component unmount
        };
    }, [socket, chess]);

    const handleSquareClick = (square: Square) => {
        if (!gameStarted || !color) return;
        if (selectedSquare) {
            const move = {
                from: selectedSquare,
                to: square,
                promotion: 'q', // always promote to queen for simplicity
            };
        const currentTurnColor = chess.turn() === 'w' ? 'white' : 'black';
        if (color !== currentTurnColor) {
            alert("It's not your turn!");
            return;
        }
            
            try{
                const result = chess.move(move);
                if (result) {
                    setBoard(chess.board());
                    socket.send(JSON.stringify({ type: MOVE, payload: move }));
                }}
            catch(err){
                alert("INVAID MOVE")
                console.error('invalid move',err);
            }finally{
                setSelectedSquare(null); 
            }
            
        } else {
            const moves = chess.moves({ square, verbose: true });
            if (moves.length > 0) {
                setSelectedSquare(square);
            }
        }
    };

    if (!socket) return <div>Connecting....</div>;

    return (
        <div className="game text-white flex justify-center">
            <div className="pt-8 max-w-screen-lg w-full ">
                <div className="grid grid-cols-6 gap-4 w-full">
                    <div className="col-span-4 w-full flex justify-center ">
                        <ChessBoard board={board} onSquareClick={handleSquareClick} playerColor={color} />
                        
                    </div>
                    {!gameStarted &&
                    <div className="col-span-2 w-full flex items-center justify-center">
                        <Button onClick={() => {
                            socket.send(JSON.stringify({ type: INIT_GAME }));
                        }}>
                            Play
                        </Button>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
};
