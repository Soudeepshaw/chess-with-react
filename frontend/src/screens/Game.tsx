import { Button } from "../Components/Button";
import { ChessBoard } from "../Components/ChessBoard";
import { minimaxRoot } from '../Components/Ai';
import { useSocket } from "../Hooks/Usesocket";
import { useEffect, useState, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "../MESSAGES/Messages";

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(() => new Chess());
    const [board, setBoard] = useState(() => chess.board());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [color, setColor] = useState<string | null>(null);
    const [playingAgainstAI, setPlayingAgainstAI] = useState(false);

    const handleMessage = useCallback((message: any) => {
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
                try {
                    chess.move(message.payload);
                    setBoard(chess.board());
                    console.log("Move Made");
                    if (playingAgainstAI && chess.turn() === 'b') {
                        setTimeout(() => {
                            const bestMove = minimaxRoot(3, chess, true);
                            chess.move(bestMove);
                            setBoard(chess.board());
                        }, 250);
                    }
                } catch (error) {
                    console.error("Invalid move:", error);
                }
                break;
            case GAME_OVER:
                alert(`Game Over. Winner: ${message.payload.winner}`);
                console.log(`Game Over. Winner: ${message.payload.winner}`);
                setGameStarted(false);
                setColor(null);
                break;
            case "CHECK":
                alert("Check");
                console.log("Check");
                break;
        }
    }, [chess, playingAgainstAI]);

    useEffect(() => {
        if (!socket) return;
        
        socket.onmessage = (event) => handleMessage(JSON.parse(event.data));
        
        return () => {
            socket.onmessage = null;
        };
    }, [socket, handleMessage]);

    const handleSquareClick = useCallback((square: Square) => {
        if (!gameStarted || !color) return;
        if (selectedSquare) {
            const move = {
                from: selectedSquare,
                to: square,
                promotion: 'q',
            };
            const currentTurnColor = chess.turn() === 'w' ? 'white' : 'black';
            if (color !== currentTurnColor) {
                alert("It's not your turn!");
                return;
            }
            
            try {
                const result = chess.move(move);
                if (result) {
                    setBoard(chess.board());
                    if(socket){

                        socket.send(JSON.stringify({ type: MOVE, payload: move }));
                        if (playingAgainstAI) {
                            setTimeout(() => {
                                const bestMove = minimaxRoot(3, chess, true);
                                chess.move(bestMove);
                                setBoard(chess.board());
                            }, 250);
                        }
                    }
                }
            } catch (err) {
                alert("Invalid move");
                console.error('invalid move', err);
            } finally {
                setSelectedSquare(null);
            }
        } else {
            const moves = chess.moves({ square, verbose: true });
            if (moves.length > 0) {
                setSelectedSquare(square);
            }
        }
    }, [gameStarted, color, selectedSquare, chess, socket, playingAgainstAI]);

    if (!socket) return <div>Connecting....</div>;

    return (
        <div className="game text-white flex justify-center">
            <div className="pt-8 max-w-screen-lg w-full">
                <div className="grid grid-cols-6 gap-4 w-full">
                    <div className="col-span-4 w-full flex justify-center">
                        <ChessBoard board={board} onSquareClick={handleSquareClick} playerColor={color} />
                    </div>
                    {!gameStarted && (
                        <div className="col-span-2 w-full flex items-center justify-center">
                            <Button onClick={() => socket.send(JSON.stringify({ type: INIT_GAME }))}>
                                Play
                            </Button>
                            <Button onClick={() => {
                                setPlayingAgainstAI(true);
                                setGameStarted(true);
                                setColor('white');
                                const newGame = new Chess();
                                setChess(newGame);
                                setBoard(newGame.board());
                            }}>
                                Play Against AI
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
