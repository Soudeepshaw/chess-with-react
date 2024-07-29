import { Button } from "../Components/Button";
import { ChessBoard } from "../Components/ChessBoard";
import { minimaxRoot } from '../Components/Ai';
import { useSocket } from "../Hooks/Usesocket";
import { useEffect, useState, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE,PLAYER_LEFT } from "../MESSAGES/Messages";
import ChatComponent from '../Components/ChatComponent'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(() => new Chess());
    const [board, setBoard] = useState(() => chess.board());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [color, setColor] = useState<string | null>(null);
    const [playingAgainstAI, setPlayingAgainstAI] = useState(false);
    const [moves, setMoves] = useState<string[]>([]);
    const [isOpponentThinking, setIsOpponentThinking] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
    const [searchingPlayer, setSearchingPlayer] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
    const [_lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

    const handleMessage = useCallback((message: any) => {
        console.log(message);
        
        switch (message.type) {
            case INIT_GAME:
                const newGame = new Chess();
                setChess(newGame);
                setBoard(newGame.board());
                setGameStarted(true);
                setColor(message.payload.color);
                setMoves([]);
                setSearchingPlayer(false);
                setWinner(null);
                setShowWinnerAnimation(false);
                console.log("Game INITIALIZED");
                toast.success("Game started! Two players have joined.");
                break;
            case MOVE:
                try {
                    const move = chess.move(message.payload);
                    setBoard(chess.board());
                    setMoves(prevMoves => [...prevMoves, `${move.color === 'w' ? 'White' : 'Black'}: ${move.san}`]);
                    setLastMove(message.payload);
                    console.log("Move Made");
                    setIsOpponentThinking(false);
                    if (playingAgainstAI && chess.turn() === 'b') {
                        setIsOpponentThinking(true);
                        setTimeout(() => {
                            const bestMove = minimaxRoot(3, chess, true);
                            const aiMove = chess.move(bestMove);
                            setBoard(chess.board());
                            setMoves(prevMoves => [...prevMoves, `Black (AI): ${aiMove.san}`]);
                            setIsOpponentThinking(false);
                            checkGameStatus();
                        }, 250);
                    } else {
                        checkGameStatus();
                    }
                } catch (error) {
                    console.error("Invalid move:", error);
                }
                break;
            case GAME_OVER:
                setGameStarted(false);
                setColor(null);
                setSearchingPlayer(false);
                setWinner(message.payload.winner);
                setTimeout(() => {
                    toast.info(`Game Over. Winner: ${message.payload.winner}`);
                    console.log(`Game Over. Winner: ${message.payload.winner}`);
                    setShowWinnerAnimation(true);
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }, 1000);
                break;
            case "CHECK":
                toast.warning("Check!");
                console.log("Check");
                break;
            case 'CHAT_MESSAGE':
                setChatMessages(prevMessages => [...prevMessages, { sender: message.payload.sender, text: message.payload.message }]);
                break;
            case PLAYER_LEFT:
                toast.warning("Opponent has left the game.");
                setWinner(color === 'white' ? 'White' : 'Black');
                setGameStarted(false);
                setShowWinnerAnimation(true);
                confetti({
                   particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                break;
        }
    }, [chess, playingAgainstAI]);
    
    const checkGameStatus = () => {
        if (chess.isCheck()) {
            toast.warning("Check!");
        }
        if (chess.isCheckmate()) {
            const winner = chess.turn() === 'w' ? 'Black' : 'White';
            setWinner(winner);
            setTimeout(() => {
                toast.error("Checkmate!");
                setShowWinnerAnimation(true);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }, 1000);
            if (socket) {
                socket.send(JSON.stringify({ type: GAME_OVER, payload: { winner } }));
            }
        } else if (chess.isDraw()) {
            setWinner('Draw');
            setTimeout(() => {
                toast.info("Game ended in a draw!");
                setShowWinnerAnimation(true);
            }, 1000);
            if (socket) {
                socket.send(JSON.stringify({ type: GAME_OVER, payload: { winner: 'Draw' } }));
            }
        }
    };

    useEffect(() => {
        if (!socket) return;
        
        socket.onmessage = (event) => handleMessage(JSON.parse(event.data));
        
        return () => {
            socket.onmessage = null;
        };
    }, [socket, handleMessage]);

    const handleSquareClick = useCallback((square: Square) => {
        if (!gameStarted || !color || isOpponentThinking) return;
        if (selectedSquare) {
            const move = {
                from: selectedSquare,
                to: square,
                promotion: 'q',
            };
            const currentTurnColor = chess.turn() === 'w' ? 'white' : 'black';
            if (color !== currentTurnColor) {
                toast.error("It's not your turn!");
                return;
            }
            
            try {
                const result = chess.move(move);
                if (result) {
                    setBoard(chess.board());
                    setMoves(prevMoves => [...prevMoves, `${result.color === 'w' ? 'White' : 'Black'}: ${result.san}`]);
                    if(socket){
                        socket.send(JSON.stringify({ type: MOVE, payload: move }));
                    }
                    if (playingAgainstAI) {
                        setIsOpponentThinking(true);
                        setTimeout(() => {
                            const bestMove = minimaxRoot(3, chess, true);
                            const aiMove = chess.move(bestMove);
                            setBoard(chess.board());
                            setMoves(prevMoves => [...prevMoves, `Black (AI): ${aiMove.san}`]);
                            setIsOpponentThinking(false);
                            checkGameStatus();
                        }, 250);
                    } else {
                        checkGameStatus();
                    }
                }
            } catch (err) {
                toast.error("Invalid move");
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
    }, [gameStarted, color, selectedSquare, chess, socket, playingAgainstAI, isOpponentThinking]);

    const sendChatMessage = (message: string) => {
        if (socket) {
            socket.send(JSON.stringify({ type: 'CHAT_MESSAGE', payload: message }));
        }
    };

    const resetGame = () => {
        window.location.reload();
    };

    if (!socket) return <div>Connecting....</div>;

    return (
        <div className="game text-white min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">
            <ToastContainer />
            <div className="max-w-screen-xl w-full p-8">
                <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
                    <div className="md:col-span-2 w-full flex flex-col items-center justify-start">
                        <div className="w-full bg-gray-800 p-4 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold mb-2 text-blue-400">Move History</h3>
                            <div className="h-64 overflow-y-auto custom-scrollbar">
                                {moves.map((move, index) => (
                                    <div key={index} className="mb-1 hover:bg-gray-700 p-1 rounded">{move}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 w-full flex flex-col items-center">
                        <ChessBoard board={board} onSquareClick={handleSquareClick} playerColor={color} />
                        {gameStarted && !winner && (
                            <div className="mt-4 text-xl font-bold bg-gray-800 p-4 rounded-lg shadow-lg">
                                {isOpponentThinking ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                                        Opponent is thinking...
                                    </div>
                                ) : (
                                    <div>Current Turn: {chess.turn() === 'w' ? 'White' : 'Black'}</div>
                                )}
                            </div>
                        )}
                        {winner && showWinnerAnimation && (
                            <div className="mt-4 text-2xl font-bold bg-green-600 p-4 rounded-lg shadow-lg animate-bounce">
                                {winner === 'Draw' ? "It's a draw!" : `${winner} wins!`}
                            </div>
                        )}
                        {winner && showWinnerAnimation && (
                            <Button 
                                onClick={resetGame}
                                className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-lg shadow-lg transform hover:scale-105"
                            >
                                Play Again
                            </Button>
                        )}
                    </div>
                    <div className="md:col-span-2 w-full flex flex-col items-center justify-start">
                        {!gameStarted ? (
                            <>
                                {searchingPlayer ? (
                                    <Button 
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-lg shadow-lg transform hover:scale-105 flex items-center justify-center"
                                        disabled={true}
                                    >
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                        Searching Player...
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => {
                                            socket.send(JSON.stringify({ type: INIT_GAME }));
                                            setSearchingPlayer(true);
                                        }}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-lg shadow-lg transform hover:scale-105"
                                    >
                                        Play Online
                                    </Button>
                                )}
                                <Button 
                                    onClick={() => {
                                        setPlayingAgainstAI(true);
                                        setGameStarted(true);
                                        setColor('white');
                                        const newGame = new Chess();
                                        setChess(newGame);
                                        setBoard(newGame.board());
                                        setMoves([]);
                                        toast.success("Game started against AI!");
                                    }}
                                    className="w-full py-3 mt-4 bg-green-600 hover:bg-green-700 transition-colors duration-200 rounded-lg shadow-lg transform hover:scale-105"
                                >
                                    Play Against AI
                                </Button>
                            </>
                        ) : (
                            <ChatComponent 
                                sendMessage={sendChatMessage} 
                                messages={chatMessages} 
                                color={color as 'white' || 'black'}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};